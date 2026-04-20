import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent {
  isLoginMode = true;

  authData = { username: '', email: '', password: '' };

  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  toggleMode(mode: boolean) {
    this.isLoginMode = mode;
    this.errorMessage = ''; 
    this.successMessage = '';
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    if (this.isLoginMode) {
      this.authService.login({
        username: this.authData.username,
        password: this.authData.password
      }).subscribe({
        next: (res: any) => {
          localStorage.setItem('token', res.token);
          this.isLoading = false;
          this.router.navigate(['/rides']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Неверный логин или пароль. Попробуйте снова.';
        }
      });

    } else {
      if (!this.authData.email.includes('@')) {
        this.errorMessage = 'Введите корректный Email адрес';
        this.isLoading = false;
        return;
      }

      this.authService.register(this.authData).subscribe({
        next: (res: any) => {
          localStorage.setItem('token', res.token);
          this.isLoading = false;
          this.successMessage = 'Аккаунт успешно создан!';
          setTimeout(() => this.router.navigate(['/rides']), 1000);
        },
        error: (err: any) => {
          this.isLoading = false;
          this.errorMessage = err.error?.error || 'Ошибка регистрации. Попробуйте снова.';
        }
      });
    }
  }
}