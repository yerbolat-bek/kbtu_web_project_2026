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

  authData = {username: '', email:'', password: ''};

  constructor(private authService: AuthService, private router: Router){}

  toggleMode(mode: boolean){
    this.isLoginMode = mode;
  }

  onSubmit(){
    if(this.isLoginMode){
      this.authService.login({
        username: this.authData.username,
        password: this.authData.password
      }).subscribe({
        next: (res: any) => {
          localStorage.setItem('token', res.token);
          this.router.navigate(['/rides']);
        },
        error: (err) => alert('Invalid credentials')
      });
    } else{
      if (!this.authData.email.includes('@')) {
        alert('Введите корректный Email');
        return;
      }

      this.authService.register(this.authData).subscribe({
        next: (res: any) => {
          localStorage.setItem('token', res.token);
          alert('Аккаунт успешно создан!');
          this.router.navigate(['/rides']); // Автоматический переход
        },
        error: (err: any) => {
          const errorMsg = err.error?.error || 'Ошибка регистрации';
          alert(errorMsg);
        }
      });
    } 
  }
}
