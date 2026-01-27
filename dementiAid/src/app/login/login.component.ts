import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginObj: any = {
    username: '',
    password: ''
  };

  constructor(private router: Router, private authService: AuthService) { }

  onLogin() {
    if (this.loginObj.username && this.loginObj.password) {
      this.authService.login(this.loginObj).subscribe({
        next: (res: any) => {
          alert('Login Successful');
          console.log(res);
          this.router.navigate(['/dashboard']); // Update this when dashboard exists
        },
        error: (err: any) => {
          alert('Login Failed: ' + (err.error?.message || 'Unknown error'));
        }
      });
    } else {
      alert('Please enter username and password');
    }
  }
}
