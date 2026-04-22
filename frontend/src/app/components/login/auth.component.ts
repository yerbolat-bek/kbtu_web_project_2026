import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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

  constructor(
    private authService: AuthService, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

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
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('username', this.authData.username);
          }
          this.isLoading = false;
          this.router.navigate(['/rides']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.error || 'Неверный логин или пароль.';
        }
      });

    } else {
      if (!this.authData.email || !this.authData.email.includes('@')) {
        this.errorMessage = 'Введите корректный Email адрес';
        this.isLoading = false;
        return;
      }

      this.authService.register(this.authData).subscribe({
        next: (res: any) => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('username', res.username);
          }
          this.isLoading = false;
          this.successMessage = 'Аккаунт успешно создан!';
          setTimeout(() => this.router.navigate(['/rides']), 1500);
        },
        error: (err: any) => {
          this.isLoading = false;
          this.errorMessage = err.error?.error || 'Ошибка регистрации. Попробуйте другой ник.';
          console.error('Registration error:', err);
        }
      });
    }
  }
}