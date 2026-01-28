import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
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

export class PeopleComponent implements OnInit, OnDestroy {

  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private cameraStream: MediaStream | null = null;

  people: Person[] = [];
  showAddModal: boolean = false;
  isEditing: boolean = false;
  editingId: string | null = null;
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

  ngOnDestroy() {
    this.stopCamera();
  }


  fetchPeople() {
    this.personService.getPeople().subscribe({
      next: (res: any) => {
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
    this.isEditing = false;
    this.editingId = null;
    this.showAddModal = true;
    this.faceCaptured = false;
    this.faceDescriptor = null;
    await this.startCamera();
  }

  async openEditModal(person: Person) {
    this.isEditing = true;
    this.editingId = person._id || null;
    this.newPerson = {
      name: person.name,
      relationship: person.relationship,
      visitFrequency: person.visitFrequency
    };
    this.showAddModal = true;
    // Camera is not strictly needed for editing metadata, but if we want to update face:
    // await this.startCamera();
  }

  closeAddModal() {
    this.showAddModal = false;
    this.isEditing = false;
    this.editingId = null;
    this.stopCamera();
    this.resetForm();
  }

  async startCamera() {
    this.cameraStream = await navigator.mediaDevices.getUserMedia({ video: {} });
    this.videoRef.nativeElement.srcObject = this.cameraStream;
  }

  stopCamera() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
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

    if (this.isEditing && this.editingId) {
      // Update logic
      const payload = {
        name: this.newPerson.name,
        relationship: this.newPerson.relationship,
        visitFrequency: this.newPerson.visitFrequency
      };

      this.personService.updatePerson(this.editingId, payload).subscribe({
        next: () => {
          alert('Person updated successfully!');
          this.fetchPeople();
          this.closeAddModal();
        },
        error: (err) => {
          alert('Failed to update person');
          console.error(err);
        }
      });
    } else {
      // Register logic
      const video = this.videoRef.nativeElement;

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

      const payload = {
        name: this.newPerson.name,
        relationship: this.newPerson.relationship,
        visitFrequency: this.newPerson.visitFrequency,
        faceDescriptor: this.faceDescriptor
      };

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
