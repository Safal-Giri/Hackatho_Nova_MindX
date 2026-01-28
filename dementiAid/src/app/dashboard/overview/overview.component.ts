import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import * as faceapi from 'face-api.js';
import { PersonService, Person } from '../../services/person.service';
import { ConversationService, Conversation } from '../../services/conversation.service';
import { AiService } from '../../services/ai.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

declare var webkitSpeechRecognition: any;

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
    isTranscribing?: boolean;
    box: faceapi.Box;
  }[] = [];

  lastConversations: { [personId: string]: string } = {};
  recentlySeen: { [name: string]: number } = {};
  isSpeaking = false;
  detectionIntervalId: any;

  // STT & AI Properties
  recognition: any;
  isRecording = false;
  activePersonId: string | null = null;
  currentTranscript = '';
  lastSeenTime = 0;
  private readonly SESSION_TIMEOUT = 10000; // 10 seconds of absence to end session

  constructor(
    private personService: PersonService,
    private conversationService: ConversationService,
    private aiService: AiService
  ) { }

  async ngOnInit() {
    await this.loadModels();
    this.fetchPeople();
    this.startCamera();
    this.initSTT();
  }

  ngOnDestroy() {
    if (this.detectionIntervalId) clearInterval(this.detectionIntervalId);
    if (this.recognition) this.recognition.stop();

    const video = this.videoRef?.nativeElement;
    if (video?.srcObject) {
      const tracks = (video.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  }

  initSTT() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            this.currentTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        console.log('Transcript update:', this.currentTranscript + interimTranscript);
      };

      this.recognition.onend = () => {
        if (this.isRecording) {
          try { this.recognition.start(); } catch (e) { }
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('STT Error:', event.error);
        if (event.error === 'no-speech') return;
        this.isRecording = false;
      };
    } else {
      console.warn('Speech recognition not supported in this browser.');
    }
  }

  async loadModels() {
    const MODEL_URL = '/assets/models';
    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  }

  fetchPeople() {
    this.personService.getPeople().subscribe({
      next: (res: any) => {
        this.people = res.data || [];

        // Prefetch last conversations
        this.people.forEach(p => {
          if (p._id) {
            this.conversationService.getLastConversation(p._id).subscribe({
              next: (conv) => {
                if (conv && conv.summary) {
                  this.lastConversations[p._id!] = conv.summary;
                }
              }
            });
          }
        });

        this.labeledDescriptors = this.people
          .filter(p => p.faceDescriptors && p.faceDescriptors.length > 0)
          .map(p => {
            const descriptorArray = p.faceDescriptors![0];
            const floatDescriptor = new Float32Array(descriptorArray);
            return new faceapi.LabeledFaceDescriptors(p.name, [floatDescriptor]);
          });
        this.faceMatcher = new faceapi.FaceMatcher(this.labeledDescriptors, 0.5);
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
      let primaryPersonDetected = false;

      for (const det of resizedDetections) {
        const match = this.faceMatcher.findBestMatch(det.descriptor);
        const person = this.people.find(p => p.name === match.label);

        const faceData = {
          label: match.label,
          relationship: person?.relationship || 'Unknown',
          visitFrequency: person?.visitFrequency || 'N/A',
          lastConversation: person ? this.lastConversations[person._id!] || 'Loading...' : '',
          personId: person?._id || '',
          isTranscribing: this.activePersonId === person?._id,
          box: det.detection.box
        };

        currentDetected.push(faceData);
        primaryPersonDetected = primaryPersonDetected || (this.activePersonId === person?._id);

        if (match.label !== 'unknown' && person) {
          const lastSeen = this.recentlySeen[match.label] || 0;
          if (now - lastSeen > 5 * 60 * 1000) {
            this.recentlySeen[match.label] = now;
            this.onNewFaceDetected(person);
          }

          this.handleSTTForDetectedPerson(person);
        }
      }

      this.detectedFaces = currentDetected;

      // Check for session timeout
      if (this.activePersonId && !primaryPersonDetected) {
        if (now - this.lastSeenTime > this.SESSION_TIMEOUT) {
          this.stopAndSummarizeSession();
        }
      } else if (this.activePersonId && primaryPersonDetected) {
        this.lastSeenTime = now;
      }
    }, 1000);
  }

  handleSTTForDetectedPerson(person: Person) {
    if (!this.activePersonId) {
      // Start new session
      this.activePersonId = person._id!;
      this.currentTranscript = '';
      this.lastSeenTime = Date.now();
      this.startRecording();
    } else if (this.activePersonId === person._id) {
      // Update last seen
      this.lastSeenTime = Date.now();
    }
  }

  startRecording() {
    if (this.recognition && !this.isRecording) {
      this.isRecording = true;
      this.recognition.start();
      console.log('Recording started for:', this.activePersonId);
    }
  }

  async stopAndSummarizeSession() {
    console.log('Ending session for:', this.activePersonId);
    const transcript = this.currentTranscript.trim();
    const personId = this.activePersonId;

    // Reset state
    this.isRecording = false;
    if (this.recognition) try { this.recognition.stop(); } catch (e) { }
    this.activePersonId = null;
    this.currentTranscript = '';

    if (transcript && personId) {
      this.aiService.summarizeTranscript(transcript).subscribe({
        next: (result) => {
          this.saveConversation(personId, result.summary);
        },
        error: (err) => console.error('Summarization failed:', err)
      });
    }
  }

  saveConversation(personId: string, summary: string) {
    this.conversationService.addConversation({
      personId,
      summary,
      username: '' // Backend will fill this from token
    }).subscribe({
      next: () => {
        this.lastConversations[personId] = summary;
        this.fetchPeople();
      },
      error: (err) => console.error('Error saving conversation:', err)
    });
  }

  onNewFaceDetected(person: Person) {
    if (person._id) {
      this.conversationService.getLastConversation(person._id).subscribe({
        next: (conversation: Conversation) => {
          this.lastConversations[person._id!] = conversation?.summary || 'No recent memories';
          this.announceDetection(person.name, person.relationship || '', conversation?.summary || '');
        },
        error: () => {
          this.lastConversations[person._id!] = 'No recent memories';
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
    utterance.onstart = () => this.isSpeaking = true;
    utterance.onend = () => this.isSpeaking = false;
    synth.speak(utterance);
  }
}

