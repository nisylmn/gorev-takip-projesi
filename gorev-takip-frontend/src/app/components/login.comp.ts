import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>🔐 Giriş Yap</h2>

        <form (ngSubmit)="login()" #loginForm="ngForm">
          <div class="form-group">
            <input
              type="email"
              [(ngModel)]="credentials.email"
              name="email"
              placeholder="E-posta"
              required
              class="form-control"
            />
          </div>

          <div class="form-group">
            <input
              type="password"
              [(ngModel)]="credentials.password"
              name="password"
              placeholder="Şifre"
              required
              class="form-control"
            />
          </div>

          <button type="submit" class="btn-login">Giriş Yap</button>
        </form>

        <div class="register-link">Hesabınız yok mu? <a (click)="goToRegister()">Kayıt Ol</a></div>

        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .login-card {
        background: white;
        padding: 40px;
        border-radius: 15px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        width: 100%;
        max-width: 400px;
      }

      h2 {
        text-align: center;
        margin-bottom: 30px;
        color: #333;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-control {
        width: 100%;
        padding: 12px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.3s ease;
      }

      .form-control:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      .btn-login {
        width: 100%;
        padding: 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .btn-login:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
      }

      .register-link {
        text-align: center;
        margin-top: 20px;
        color: #6b7280;
      }

      .register-link a {
        color: #667eea;
        cursor: pointer;
        text-decoration: none;
      }

      .register-link a:hover {
        text-decoration: underline;
      }

      .error-message {
        background: #fee;
        color: #c00;
        padding: 10px;
        border-radius: 5px;
        margin-top: 15px;
        text-align: center;
      }
    `,
  ],
})
export class LoginComponent {
  credentials = {
    email: '',
    password: '',
  };

  errorMessage = '';

  constructor(private router: Router, private http: HttpClient) {}

  login(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Lütfen tüm alanları doldurun!';
      return;
    }

    this.http.post<any>('http://localhost:5066/api/auth/login', this.credentials).subscribe({
      next: (response) => {
        if (response.token) {
          localStorage.setItem('jwt_token', response.token);
          localStorage.setItem('current_user', JSON.stringify(response.user));
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.errorMessage = 'E-posta veya şifre hatalı!';
      },
    });
  }

  goToRegister(): void {
    this.router.navigate(['/signup']);
  }
}
