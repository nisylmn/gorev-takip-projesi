import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="signup-container">
      <div class="signup-card">
        <h2>📝 Kayıt Ol</h2>

        <form (ngSubmit)="register()" #signupForm="ngForm">
          <div class="form-group">
            <input
              type="text"
              [(ngModel)]="userData.fullName"
              name="fullName"
              placeholder="Ad Soyad"
              required
              class="form-control"
            />
          </div>

          <div class="form-group">
            <input
              type="email"
              [(ngModel)]="userData.email"
              name="email"
              placeholder="E-posta"
              required
              class="form-control"
            />
          </div>

          <div class="form-group">
            <input
              type="password"
              [(ngModel)]="userData.password"
              name="password"
              placeholder="Şifre"
              required
              class="form-control"
            />
          </div>

          <button type="submit" class="btn-register">Kayıt Ol</button>
        </form>

        <div class="login-link">Zaten hesabınız var mı? <a (click)="goToLogin()">Giriş Yap</a></div>

        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div *ngIf="successMessage" class="success-message">
          {{ successMessage }}
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .signup-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .signup-card {
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

      .btn-register {
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

      .btn-register:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
      }

      .login-link {
        text-align: center;
        margin-top: 20px;
        color: #6b7280;
      }

      .login-link a {
        color: #667eea;
        cursor: pointer;
        text-decoration: none;
      }

      .login-link a:hover {
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

      .success-message {
        background: #d1fae5;
        color: #065f46;
        padding: 10px;
        border-radius: 5px;
        margin-top: 15px;
        text-align: center;
      }
    `,
  ],
})
export class SignupComponent {
  userData = {
    fullName: '',
    email: '',
    password: '',
  };

  errorMessage = '';
  successMessage = '';

  constructor(private router: Router, private http: HttpClient, private toastr: ToastrService) {}

  register(): void {
    if (!this.userData.fullName || !this.userData.email || !this.userData.password) {
      this.toastr.warning('Lütfen tüm alanları doldurun!', 'Uyarı');
      return;
    }

    this.http.post<any>('http://localhost:5066/api/auth/register', this.userData).subscribe({
      next: (response) => {
        this.toastr.success('Kayıt başarılı! Giriş yapabilirsiniz.', 'Başarılı');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('Register error:', err);

        if (err.error?.message) {
          this.toastr.error(err.error.message, 'Hata');
        } else if (err.status === 409) {
          this.toastr.error('Bu e-posta adresi zaten kayıtlı!', 'Hata');
        } else {
          this.toastr.error('Kayıt sırasında bir hata oluştu!', 'Hata');
        }
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
