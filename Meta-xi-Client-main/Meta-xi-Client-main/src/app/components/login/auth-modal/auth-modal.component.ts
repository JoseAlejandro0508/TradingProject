import { Component, inject, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { NotificationService } from '../../../services/products/notification.service';
import { environment } from '../../../../environments/environment';

export const FLAG_DB: Record<string, string> = {
  '57': '🇨🇴', '53': '🇨🇺', '34': '🇪🇸', '54': '🇦🇷',
  '52': '🇲🇽', '51': '🇵🇪', '55': '🇧🇷', '56': '🇨🇱',
  '58': '🇻🇪', '1': '🇺🇸', '44': '🇬🇧', '41': '🇨🇭', '593': '🇪🇨'
};

export interface PasswordStrength {
  label: 'Vacía' | 'Insegura' | 'Segura' | 'Bien segura' | 'Muy segura';
  color: string;
  bars: number;
}

export interface LoginData {
  email: string | null;
  phoneNumber: string | null;
  password: string;
  codeReferrer?: string | null;
}

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.scss',
})
export class AuthModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notification = inject(NotificationService);

  @Input() mode: 'reg' | 'log' = 'reg';
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();

  regForm!: FormGroup;
  logForm!: FormGroup;

  regFlag = '🌐';
  logFlag = '🌐';

  regPasswordType = 'password';
  regConfirmPasswordType = 'password';
  logPasswordType = 'password';

  smsTimer = 0;
  isSubmitting = false;

  passwordStrength: PasswordStrength = { label: 'Vacía', color: 'var(--text-muted)', bars: 0 };

  codeReferrer: string | null = null;

  ngOnInit(): void {
    this.initForms();
    this.route.queryParamMap.subscribe(params => {
      this.codeReferrer = params.get('code');
    });
  }

  private initForms() {
    this.regForm = this.fb.group({
      countryCode: ['', [Validators.required, Validators.minLength(1)]],
      phone: ['', [Validators.required, Validators.minLength(7)]],
      smsCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      teamCode: ['TV-GLOBAL-2026'],
    });

    this.logForm = this.fb.group({
      countryCode: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.minLength(7)]],
      password: ['', [Validators.required]],
      keepActive: [false],
    });
  }

  onCountryCodeChange(type: 'reg' | 'log'): void {
    const form = type === 'reg' ? this.regForm : this.logForm;
    const code = form.get('countryCode')?.value?.replace(/\D/g, '') || '';
    const flag = FLAG_DB[code] || '🌐';
    if (type === 'reg') {
      this.regFlag = flag;
    } else {
      this.logFlag = flag;
    }
    if (code.length > 0) {
      form.patchValue({ countryCode: '+' + code }, { emitEvent: false });
    } else {
      form.patchValue({ countryCode: '' }, { emitEvent: false });
    }
  }

  onPhoneInput(type: 'reg' | 'log'): void {
    const form = type === 'reg' ? this.regForm : this.logForm;
    const code = form.get('countryCode')?.value?.replace(/\D/g, '') || '';
    if (code.length === 0) {
      form.patchValue({ phone: '' }, { emitEvent: false });
      return;
    }
    let phone = form.get('phone')?.value?.replace(/\D/g, '') || '';
    form.patchValue({ phone }, { emitEvent: false });
  }

  evaluatePasswordStrength(password: string): PasswordStrength {
    if (password.length === 0) {
      return { label: 'Vacía', color: 'var(--text-muted)', bars: 0 };
    }
    if (password.length < 6) {
      return { label: 'Insegura', color: 'var(--accent-red)', bars: 1 };
    }
    if (password.length >= 6 && password.length < 8) {
      return { label: 'Segura', color: '#ff9800', bars: 2 };
    }
    if (password.length === 8) {
      return { label: 'Bien segura', color: '#b0ff00', bars: 3 };
    }
    return { label: 'Muy segura', color: 'var(--accent-green)', bars: 4 };
  }

  onPasswordInput(): void {
    const password = this.regForm.get('password')?.value || '';
    this.passwordStrength = this.evaluatePasswordStrength(password);
  }

  onSMSInput(): void {
    let val = this.regForm.get('smsCode')?.value || '';
    val = val.replace(/\D/g, '').slice(0, 6);
    this.regForm.patchValue({ smsCode: val }, { emitEvent: false });
  }

  sendSMS(): void {
    const code = this.regForm.get('countryCode')?.value?.replace(/\D/g, '');
    const phone = this.regForm.get('phone')?.value?.replace(/\D/g, '');
    if (!code || phone.length < 7 || this.smsTimer > 0) return;

    this.smsTimer = 60;
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.regForm.patchValue({ smsCode: generatedCode });

    const interval = setInterval(() => {
      this.smsTimer--;
      if (this.smsTimer <= 0) {
        clearInterval(interval);
      }
    }, 1000);
  }

  togglePasswordVisibility(field: 'reg' | 'regConfirm' | 'log'): void {
    if (field === 'reg') {
      this.regPasswordType = this.regPasswordType === 'password' ? 'text' : 'password';
    } else if (field === 'regConfirm') {
      this.regConfirmPasswordType = this.regConfirmPasswordType === 'password' ? 'text' : 'password';
    } else {
      this.logPasswordType = this.logPasswordType === 'password' ? 'text' : 'password';
    }
  }

  isRegFormValid(): boolean {
    const form = this.regForm;
    const phoneValid = form.get('countryCode')?.value?.length >= 2 && form.get('phone')?.value?.length >= 7;
    const smsValid = form.get('smsCode')?.value?.length === 6;
    const pass = form.get('password')?.value || '';
    const conf = form.get('confirmPassword')?.value || '';
    const passValid = pass.length >= 8;
    const confValid = conf === pass && conf.length >= 8;
    const strengthValid = this.passwordStrength.label === 'Bien segura' || this.passwordStrength.label === 'Muy segura';
    return phoneValid && smsValid && passValid && confValid && strengthValid;
  }

  isLoginFormValid(): boolean {
    const form = this.logForm;
    const phoneValid = form.get('countryCode')?.value?.length >= 2 && form.get('phone')?.value?.length >= 7;
    const passValid = (form.get('password')?.value || '').length >= 1;
    return phoneValid && passValid;
  }

  close(): void {
    this.closeModal.emit();
  }

  overlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('auth-overlay')) {
      this.close();
    }
  }

  async onRegisterSubmit() {
    if (!this.isRegFormValid() || this.isSubmitting) return;
    this.isSubmitting = true;
    const { countryCode, phone, password } = this.regForm.value;
    const data: LoginData = {
      email: null,
      phoneNumber: countryCode.replace(/\D/g, '') + phone,
      password,
      codeReferrer: this.codeReferrer || null,
    };
    try {
      const response = await this.register(data);
      localStorage.setItem('username', data.phoneNumber || '');
      this.notification.correct(response.message || 'Registro exitoso');
      setTimeout(() => {
        this.mode = 'log';
        this.regForm.reset();
        this.logForm.reset();
        this.passwordStrength = { label: 'Vacía', color: 'var(--text-muted)', bars: 0 };
      }, 3000);
    } catch (error: any) {
      this.notification.errorMessage(`${error}`);
    } finally {
      this.isSubmitting = false;
    }
  }

  async onLoginSubmit() {
    if (!this.isLoginFormValid() || this.isSubmitting) return;
    this.isSubmitting = true;
    const { countryCode, phone, password } = this.logForm.value;
    const data: LoginData = {
      email: null,
      phoneNumber: countryCode.replace(/\D/g, '') + phone,
      password,
    };
    try {
      const response = await this.login(data);
      localStorage.setItem('token', response);
      localStorage.setItem('username', data.phoneNumber || '');
      this.notification.correct('Login exitoso');
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 2000);
    } catch (error: any) {
      this.notification.errorMessage(`${error}`);
    } finally {
      this.isSubmitting = false;
    }
  }

  async login(data: LoginData): Promise<any> {
    const url = `${environment.apiUrl}/User/Login`;
    try {
      const response = await firstValueFrom(this.http.post(url, data, { responseType: 'text' }));
      return response;
    } catch (error: any) {
      let errorMsg = 'Error desconocido';
      if (error.error) {
        if (typeof error.error === 'string') {
          errorMsg = error.error;
        } else if (error.error.message) {
          errorMsg = error.error.message;
        }
      }
      throw errorMsg;
    }
  }

  async register(data: LoginData): Promise<any> {
    const url = `${environment.apiUrl}/User/UserRegister`;
    try {
      const response = await firstValueFrom(this.http.post<any>(url, data, { observe: 'response' }));
      if (response.status === 200) {
        return response.body;
      } else {
        return 'Error: ' + response.body;
      }
    } catch (error: any) {
      let errorMsg = 'Error desconocido';
      if (typeof error.error === 'string') {
        errorMsg = error.error;
      } else if (error.error && error.error.message) {
        errorMsg = error.error.message;
      }
      throw errorMsg;
    }
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const key = event.key;
    if (!/^[0-9]$/.test(key) && key !== 'Backspace' && key !== 'Delete' && key !== 'Tab') {
      event.preventDefault();
    }
  }

  switchMode(newMode: 'reg' | 'log'): void {
    this.mode = newMode;
  }
}
