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
    email: '',
    password: ''
  };

  constructor(private router: Router, private authService: AuthService) { }

  onLogin() {
    if (this.loginObj.email && this.loginObj.password) {
      this.authService.login(this.loginObj).subscribe({
        next: (res: any) => {
          alert('Login Successful');
          localStorage.setItem('token', res.token)
          console.log(res);
          this.router.navigate(['/dashboard/overview']);
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
