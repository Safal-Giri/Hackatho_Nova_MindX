import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerObj: any = {
    username: '',
    age: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  constructor(private router: Router, private authService: AuthService) { }

  onRegister() {
    if (this.registerObj.password !== this.registerObj.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (this.registerObj.username && this.registerObj.email && this.registerObj.password) {
      this.authService.register(this.registerObj).subscribe({
        next: (res: any) => {
          alert('Registration Successful');
          console.log(res);
          this.router.navigate(['/login']);
        },
        error: (err: any) => {
          alert('Registration Failed: ' + (err.error?.message || 'Unknown error'));
        }
      });
    } else {
      alert('Please fill in all fields');
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
