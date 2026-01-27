import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonService, Person } from '../../services/person.service';
import { FormsModule } from '@angular/forms';

import * as faceapi from 'face-api.js';
@Component({
  selector: 'app-people',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './people.component.html',
  styleUrl: './people.component.css'
})

export class PeopleComponent implements OnInit {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  people: Person[] = [];
  showAddModal: boolean = false;
  faceCaptured = false;

  newPerson: any = {
    name: '',
    relationship: '',
    visitFrequency: '',
  };
  faceDescriptor: number[] | null = null

  constructor(private personService: PersonService) { }

  async ngOnInit() {
    
    await this.loadModels();
    // Uncomment when backend is ready
    this.fetchPeople();
  }

fetchPeople() {
  this.personService.getPeople().subscribe({
    next: (res:any) => {
      if (res && res.status === 'success' && Array.isArray(res.data)) {
        this.people = res.data;
      } else {
        console.warn('Unexpected response format:', res);
        this.people = [];
      }
    },
    error: (err) => {
      console.error('Error fetching people', err);
      this.people = [];
    }
  });
}


  async loadModels() {
    const MODEL_URL = '/assets/models'
    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    console.log("models loaded")
  }


  async openAddModal() {
    this.showAddModal = true;
    this.faceCaptured = false;
    this.faceDescriptor = null;
    await this.startCamera();
  }

  closeAddModal() {
    this.showAddModal = false;
    this.stopCamera();
    this.resetForm();
  }

  async startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    this.videoRef.nativeElement.srcObject = stream;
  }

  stopCamera() {
    const video = this.videoRef?.nativeElement;
    if (video?.srcObject) {
      const tracks = (video.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  }


  resetForm() {
    this.newPerson = { name: '', relationship: '', visitFrequency: '' };

  }

  async onSubmit() {
    if (!this.newPerson.name || !this.newPerson.relationship) {
      alert('Please complete all fields.');
      return;
    }

    const video = this.videoRef.nativeElement;

    // Capture face on submit
    const detection = await faceapi
      .detectSingleFace(video)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      alert('No face detected. Please make sure your face is visible.');
      return;
    }

    this.faceDescriptor = Array.from(detection.descriptor);
    this.faceCaptured = true;

    // Prepare payload for backend
    const payload = {
      name: this.newPerson.name,
      relationship: this.newPerson.relationship,
      visitFrequency: this.newPerson.visitFrequency,
      faceDescriptor: this.faceDescriptor
    };

    // Send to backend
    this.personService.registerFace(payload).subscribe({
      next: () => {
        alert('Person registered successfully!');
        this.fetchPeople();
        this.closeAddModal();
      },
      error: (err) => {
        alert('Failed to register person');
        console.error(err);
      }
    });
  }

deletePerson(id: string) {
  if (!id) return;
  if (confirm('Are you sure you want to delete this person?')) {
    this.personService.deletePerson(id).subscribe({
      next: (res) => {
        alert(res.message || 'Person deleted successfully');
        this.fetchPeople(); // refresh list
      },
      error: (err) => {
        console.error('Delete failed', err);
        alert('Failed to delete person');
      }
    });
  }
}

}
