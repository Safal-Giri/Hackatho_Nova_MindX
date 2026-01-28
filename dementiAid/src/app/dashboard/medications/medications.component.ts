import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicineService, Medicine } from '../../services/medicine.service';

@Component({
  selector: 'app-medications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medications.component.html',
  styleUrl: './medications.component.css'
})
export class MedicationsComponent implements OnInit {
  medicines: Medicine[] = [];
  showModal = false;
  isEditing = false;
  editingId: string | null = null;

  newMed: Medicine = {
    name: '',
    dose: '',
    schedule: 'Daily',
    time: ''
  };

  constructor(private medicineService: MedicineService) { }

  ngOnInit() {
    this.loadMedicines();
  }

  loadMedicines() {
    this.medicineService.getMedicines().subscribe({
      next: (res) => {
        this.medicines = res.data;
      },
      error: (err) => console.error('Error loading medicines:', err)
    });
  }

  openAddModal() {
    this.isEditing = false;
    this.editingId = null;
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(med: Medicine) {
    this.isEditing = true;
    this.editingId = med._id!;
    this.newMed = { ...med };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  resetForm() {
    this.newMed = {
      name: '',
      dose: '',
      schedule: 'Daily',
      time: ''
    };
  }

  onSubmit() {
    if (!this.newMed.name || !this.newMed.dose || !this.newMed.time) {
      alert('Please fill in all fields');
      return;
    }

    if (this.isEditing && this.editingId) {
      this.medicineService.updateMedicine(this.editingId, this.newMed).subscribe({
        next: () => {
          alert('Medicine updated successfully!');
          this.loadMedicines();
          this.closeModal();
        },
        error: (err) => alert('Error updating medicine')
      });
    } else {
      this.medicineService.addMedicine(this.newMed).subscribe({
        next: () => {
          alert('Medicine added successfully!');
          this.loadMedicines();
          this.closeModal();
        },
        error: (err) => alert('Error adding medicine')
      });
    }
  }

  deleteMed(id: string) {
    if (confirm('Are you sure you want to delete this schedule?')) {
      this.medicineService.deleteMedicine(id).subscribe({
        next: () => {
          alert('Medicine deleted successfully');
          this.loadMedicines();
        },
        error: (err) => alert('Error deleting medicine')
      });
    }
  }
}
