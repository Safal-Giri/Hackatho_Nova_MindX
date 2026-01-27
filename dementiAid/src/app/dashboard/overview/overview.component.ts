import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import * as faceapi from 'face-api.js';
import { PersonService, Person } from '../../services/person.service';
import { ConversationService, Conversation } from '../../services/conversation.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent implements OnInit, OnDestroy {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  people: Person[] = [];
  labeledDescriptors: faceapi.LabeledFaceDescriptors[] = [];
  faceMatcher: faceapi.FaceMatcher | null = null;

  detectedFaces: {
    label: string;
    relationship: string;
    visitFrequency: string;
    lastConversation: string;
    personId: string;
  }[] = [];

  recentlySeen: { [name: string]: number } = {};
  isSpeaking = false;
  detectionIntervalId: any;

  constructor(
    private personService: PersonService,
    private conversationService: ConversationService
  ) { }

  async ngOnInit() {
    await this.loadModels();
    this.fetchPeople();
    this.startCamera();
  }

  ngOnDestroy() {
    if (this.detectionIntervalId) clearInterval(this.detectionIntervalId);
    const video = this.videoRef?.nativeElement;
    if (video?.srcObject) {
      const tracks = (video.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  }

  async loadModels() {
    const MODEL_URL = '/assets/models';
    console.log('Loading models from:', MODEL_URL);

    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

    console.log('Face-api models loaded');
  }

  fetchPeople() {
    this.personService.getPeople().subscribe({
      next: (res: any) => {
        this.people = res.data || [];

        this.labeledDescriptors = this.people
          .filter(p => p.faceDescriptors && p.faceDescriptors.length > 0)
          .map(p => {
            const descriptorArray = p.faceDescriptors![0]; // first descriptor
            const floatDescriptor = new Float32Array(descriptorArray);
            return new faceapi.LabeledFaceDescriptors(p.name, [floatDescriptor]);
          });

        this.faceMatcher = new faceapi.FaceMatcher(this.labeledDescriptors, 0.5);
        console.log('Labeled descriptors:', this.labeledDescriptors);
      },
      error: (err) => console.error('Error fetching people', err)
    });
  }


  async startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      const video = this.videoRef.nativeElement;
      video.srcObject = stream;

      video.onloadedmetadata = () => {
        video.play();
        this.runDetectionLoop();
      };
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  }

  runDetectionLoop() {
    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;

    this.detectionIntervalId = setInterval(async () => {
      if (!this.faceMatcher) return;
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      canvas.width = displaySize.width;
      canvas.height = displaySize.height;
      faceapi.matchDimensions(canvas, displaySize);

      if (
        !faceapi.nets.ssdMobilenetv1.isLoaded ||
        !faceapi.nets.faceLandmark68Net.isLoaded ||
        !faceapi.nets.faceRecognitionNet.isLoaded
      ) return;

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptors();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = Date.now();
      const currentDetected: any[] = [];

      for (const det of resizedDetections) {
        const match = this.faceMatcher.findBestMatch(det.descriptor);
        const person = this.people.find(p => p.name === match.label);

        const faceData = {
          label: match.label,
          relationship: person?.relationship || 'Unknown',
          visitFrequency: person?.visitFrequency || 'N/A',
          lastConversation: person?.lastConversation || '',
          personId: person?._id || ''
        };

        currentDetected.push(faceData);

        const drawBox = new faceapi.draw.DrawBox(det.detection.box, {
          label: match.label
        });
        drawBox.draw(canvas);

        if (match.label !== 'unknown' && person) {
          const lastSeen = this.recentlySeen[match.label] || 0;
          if (now - lastSeen > 5 * 60 * 1000) {
            this.recentlySeen[match.label] = now;
            this.onNewFaceDetected(person);
          }
        }
      }

      this.detectedFaces = currentDetected;
    }, 1000);
  }


  onNewFaceDetected(person: Person) {
    console.log('New face detected:', person.name);

    if (person._id) {
      this.conversationService.getLastConversation(person._id).subscribe({
        next: (conversation: Conversation) => {
          this.updateConversation(person._id!, conversation?.summary || '');
          this.announceDetection(person.name, person.relationship || '', conversation?.summary || '');
        },
        error: () => {
          this.announceDetection(person.name, person.relationship || '', '');
        }
      });
    } else {
      this.announceDetection(person.name, person.relationship || '', '');
    }
  }

  updateConversation(personId: string, summary: string) {
    const faceIndex = this.detectedFaces.findIndex(f => f.personId === personId);
    if (faceIndex !== -1) {
      this.detectedFaces[faceIndex].lastConversation = summary;
    }
  }

  announceDetection(name: string, relationship: string, lastConversation: string) {
    if (this.isSpeaking) return;

    const synth = window.speechSynthesis;

    let message = `Hello, this is ${name}`;
    if (relationship) message += `, your ${relationship}`;
    if (lastConversation) message += `. Last time you talked about: ${lastConversation}`;

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => this.isSpeaking = true;
    utterance.onend = () => this.isSpeaking = false;

    synth.speak(utterance);
    console.log('TTS:', message);
  }
}
