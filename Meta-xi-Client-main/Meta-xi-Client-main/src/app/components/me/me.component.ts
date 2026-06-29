import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { NotificationService } from '../../services/products/notification.service';
import { ThemeService } from '../../services/theme.service';
import { environment } from '../../../environments/environment';

interface ChatMessage {
  type: 'user' | 'system';
  text?: string;
  image?: string;
}

interface Bot {
  name: string;
  profit: number;
  baseProfit: number;
}

interface TxItem {
  title: string;
  status: 'approved' | 'pending';
  from: string;
  to: string;
  date: string;
  amountSent: string;
  amountReceived: string;
  receivedColor?: string;
}

interface AccountDetails {
  yesterday: string;
  today: string;
  month: string;
  team: string;
  total: string;
}

@Component({
  selector: 'app-me',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './me.component.html',
  styleUrl: './me.component.scss',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.4s cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class MeComponent implements OnInit, OnDestroy {
  // ─── Services ────────────────────────────────────────
  private http = inject(HttpClient);
  private notification = inject(NotificationService);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  // ─── User & Balance ──────────────────────────────────
  username: string = localStorage.getItem('username') || '';
  balanceCOP: number = 0;
  balanceUSD: string = '0.00';
  referralLink: string = '';

  // ─── Theme ───────────────────────────────────────────
  isDarkMode = this.themeService.getTheme() === 'dark';

  // ─── View State ──────────────────────────────────────
  currentView: 'main' | 'pass' | 'phone' | 'withdrawPass' = 'main';
  submitting = false;

  // ─── Accordion ───────────────────────────────────────
  accordionOpen: Record<string, boolean> = {
    'acc-deposits': false,
    'acc-withdraws': false,
    'acc-details': false,
    'acc-bots': false,
    'acc-security': false,
  };

  // ─── Chat ────────────────────────────────────────────
  chatOpen = false;
  chatInput = '';
  chatMessages: ChatMessage[] = [
    { type: 'system', text: 'Hola, soy tu asesor financiero de TradingView. ¿En qué puedo ayudarte con tus balances u operaciones hoy?' }
  ];

  // ─── Bots ────────────────────────────────────────────
  bots: Bot[] = [
    { name: 'Bot Scalper BTC/USDT', profit: 94.12, baseProfit: 94.12 },
    { name: 'Bot AI Swing ETH', profit: 77.88, baseProfit: 77.88 },
  ];
  private botInterval: any;

  // ─── History ─────────────────────────────────────────
  depositHistory: TxItem[] = [];
  withdrawHistory: TxItem[] = [];
  historyLoaded = false;
  historyLoading = false;

  // ─── Account Details ─────────────────────────────────
  accountDetails: AccountDetails = {
    yesterday: '0',
    today: '0',
    month: '0',
    team: '0',
    total: '0',
  };

  // ─── Captcha ──────────────────────────────────────────
  captchaPass = '';
  captchaPhone = '';
  captchaWithdrawPass = '';

  // ─── Password Visibility ─────────────────────────────
  passFieldTypeOld = 'password';
  passFieldTypeNew = 'password';
  passFieldTypeConfirm = 'password';
  withdrawPassFieldTypeOld = 'password';
  withdrawPassFieldTypeNew = 'password';
  withdrawPassFieldTypeConfirm = 'password';

  // ─── Form Validity Flags ──────────────────────────────
  passFormValid = false;
  phoneFormValid = false;
  withdrawPassFormValid = false;

  // ─── Password Form ───────────────────────────────────
  passForm = new FormGroup(
    {
      oldPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6), this.passwordStrengthValidator]),
      confirmPassword: new FormControl('', [Validators.required]),
      captchaPass: new FormControl('', [Validators.required]),
    },
    { validators: this.passwordMatchValidator }
  );

  // ─── Withdraw Password Form ────────────────────────────
  withdrawPassForm = new FormGroup(
    {
      oldWithdrawPassword: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]),
      newWithdrawPassword: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(4), Validators.pattern('^[0-9]+$')]),
      confirmWithdrawPassword: new FormControl('', [Validators.required]),
      captchaWithdrawPass: new FormControl('', [Validators.required]),
    },
    { validators: this.withdrawPasswordMatchValidator }
  );

  // ─── Phone Form ──────────────────────────────────────
  phoneForm = new FormGroup({
    oldPhone: new FormControl('', [Validators.required, Validators.minLength(7)]),
    newPhone: new FormControl('', [Validators.required, Validators.minLength(7)]),
    captchaPhone: new FormControl('', [Validators.required]),
  });

  constructor() {
    this.captchaPass = this.generateCode();
    this.captchaPhone = this.generateCode();
    this.captchaWithdrawPass = this.generateCode();
  }

  // ─── Lifecycle ──────────────────────────────────────
  ngOnInit(): void {
    this.getMyBalance();
    this.getReferralLink();
    this.getAccountDetails();
    this.startBotSimulation();
  }

  ngOnDestroy(): void {
    if (this.botInterval) {
      clearInterval(this.botInterval);
    }
  }

  // ─── Theme ──────────────────────────────────────────
  toggleTheme(): void {
    const next = this.themeService.toggleTheme();
    this.isDarkMode = next === 'dark';
  }

  // ─── Accordion ───────────────────────────────────────
  toggleAccordion(id: string): void {
    const currentlyOpen = this.accordionOpen[id];
    // Close all
    Object.keys(this.accordionOpen).forEach((key) => {
      this.accordionOpen[key] = false;
    });
    // Toggle the clicked one
    if (!currentlyOpen) {
      this.accordionOpen[id] = true;
      // Lazy load history when opening deposits or withdraws accordion
      if ((id === 'acc-deposits' || id === 'acc-withdraws') && !this.historyLoaded && !this.historyLoading) {
        this.loadHistory();
      }
    }
  }

  // ─── Bot Simulation ─────────────────────────────────
  private startBotSimulation(): void {
    this.botInterval = setInterval(() => {
      this.bots.forEach((bot) => {
        const delta = (Math.random() * 0.4 - 0.2);
        bot.profit = parseFloat((bot.baseProfit + delta).toFixed(2));
      });
    }, 3000);
  }

  // ─── Chat ───────────────────────────────────────────
  toggleChat(): void {
    this.chatOpen = !this.chatOpen;
  }

  sendMessage(): void {
    const text = this.chatInput.trim();
    if (!text) return;

    this.chatMessages.push({ type: 'user', text });
    this.chatInput = '';
    this.scrollChatToBottom();

    setTimeout(() => {
      const ticketId = Math.floor(1000 + Math.random() * 9000);
      this.chatMessages.push({
        type: 'system',
        text: `Recibido. Un asesor de cuentas premium tomará tu ticket de inmediato. ID: #TV-${ticketId}`,
      });
      this.scrollChatToBottom();
    }, 1000);
  }

  handleMediaSelection(file: File | null): void {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.notification.errorMessage('Solo se permiten imágenes');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      this.chatMessages.push({ type: 'user', image: result });
      this.scrollChatToBottom();

      setTimeout(() => {
        this.chatMessages.push({
          type: 'system',
          text: 'Captura recibida con éxito. El departamento técnico está revisando los detalles del archivo.',
        });
        this.scrollChatToBottom();
      }, 1200);
    };
    reader.readAsDataURL(file);
  }

  private scrollChatToBottom(): void {
    setTimeout(() => {
      const chatBody = document.getElementById('chatBody');
      if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    }, 50);
  }

  // ─── View Switching ──────────────────────────────────
  switchView(view: 'main' | 'pass' | 'phone' | 'withdrawPass'): void {
    this.currentView = view;
    if (view !== 'main') {
      this.resetFormFields();
      this.captchaPass = this.generateCode();
      this.captchaPhone = this.generateCode();
      this.captchaWithdrawPass = this.generateCode();
    }
  }

  private resetFormFields(): void {
    this.passForm.reset();
    this.phoneForm.reset();
    this.withdrawPassForm.reset();
    this.passFormValid = false;
    this.phoneFormValid = false;
    this.withdrawPassFormValid = false;
    this.passFieldTypeOld = 'password';
    this.passFieldTypeNew = 'password';
    this.passFieldTypeConfirm = 'password';
    this.withdrawPassFieldTypeOld = 'password';
    this.withdrawPassFieldTypeNew = 'password';
    this.withdrawPassFieldTypeConfirm = 'password';
  }

  // ─── Password Visibility Toggle ──────────────────────
  togglePassVisibility(field: 'old' | 'new' | 'confirm'): void {
    switch (field) {
      case 'old':
        this.passFieldTypeOld = this.passFieldTypeOld === 'password' ? 'text' : 'password';
        break;
      case 'new':
        this.passFieldTypeNew = this.passFieldTypeNew === 'password' ? 'text' : 'password';
        break;
      case 'confirm':
        this.passFieldTypeConfirm = this.passFieldTypeConfirm === 'password' ? 'text' : 'password';
        break;
    }
  }

  toggleWithdrawPassVisibility(field: 'old' | 'new' | 'confirm'): void {
    switch (field) {
      case 'old':
        this.withdrawPassFieldTypeOld = this.withdrawPassFieldTypeOld === 'password' ? 'text' : 'password';
        break;
      case 'new':
        this.withdrawPassFieldTypeNew = this.withdrawPassFieldTypeNew === 'password' ? 'text' : 'password';
        break;
      case 'confirm':
        this.withdrawPassFieldTypeConfirm = this.withdrawPassFieldTypeConfirm === 'password' ? 'text' : 'password';
        break;
    }
  }

  // ─── Form Validation: Password ───────────────────────
  validatePassForm(): void {
    const captchaValue = this.passForm.get('captchaPass')?.value || '';
    const captchaValid = captchaValue === this.captchaPass;

    if (captchaValid) {
      this.passForm.get('captchaPass')?.setErrors(null);
    } else if (captchaValue.length > 0) {
      this.passForm.get('captchaPass')?.setErrors({ captchaMismatch: true });
    }

    this.passFormValid =
      this.passForm.get('oldPassword')?.valid === true &&
      this.passForm.get('newPassword')?.valid === true &&
      this.passForm.get('confirmPassword')?.valid === true &&
      !this.passForm.hasError('passwordMismatch') &&
      captchaValid &&
      !this.submitting;
  }

  // ─── Form Validation: Phone ─────────────────────────
  validatePhoneForm(): void {
    const captchaValue = this.phoneForm.get('captchaPhone')?.value || '';
    const captchaValid = captchaValue === this.captchaPhone;

    if (captchaValid) {
      this.phoneForm.get('captchaPhone')?.setErrors(null);
    } else if (captchaValue.length > 0) {
      this.phoneForm.get('captchaPhone')?.setErrors({ captchaMismatch: true });
    }

    this.phoneFormValid =
      this.phoneForm.get('oldPhone')?.valid === true &&
      this.phoneForm.get('newPhone')?.valid === true &&
      captchaValid &&
      !this.submitting;
  }

  // ─── Form Validation: Withdraw Password ───────────────
  validateWithdrawPassForm(): void {
    const captchaValue = this.withdrawPassForm.get('captchaWithdrawPass')?.value || '';
    const captchaValid = captchaValue === this.captchaWithdrawPass;

    if (captchaValid) {
      this.withdrawPassForm.get('captchaWithdrawPass')?.setErrors(null);
    } else if (captchaValue.length > 0) {
      this.withdrawPassForm.get('captchaWithdrawPass')?.setErrors({ captchaMismatch: true });
    }

    this.withdrawPassFormValid =
      this.withdrawPassForm.get('oldWithdrawPassword')?.valid === true &&
      this.withdrawPassForm.get('newWithdrawPassword')?.valid === true &&
      this.withdrawPassForm.get('confirmWithdrawPassword')?.valid === true &&
      !this.withdrawPassForm.hasError('passwordMismatch') &&
      captchaValid &&
      !this.submitting;
  }

  // ─── Custom Validators ──────────────────────────────
  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[^\da-zA-Z]/.test(password);
    const errors: string[] = [];
    if (!hasUpper) errors.push('una mayúscula');
    if (!hasLower) errors.push('una minúscula');
    if (!hasDigit) errors.push('un número');
    if (!hasSpecial) errors.push('un carácter especial');
    if (errors.length > 0) {
      return { passwordStrength: `La contraseña debe tener al menos ${errors.join(', ')}` };
    }
    return null;
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  private withdrawPasswordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newWithdrawPassword')?.value;
    const confirmPassword = control.get('confirmWithdrawPassword')?.value;
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  // ─── API: Get Balance ───────────────────────────────
  async getMyBalance(): Promise<void> {
    const url = `${environment.apiUrl}/Wallet/GetBalanceUsdAndCop/${this.username}`;
    try {
      const response: any = await firstValueFrom(this.http.get(url));
      this.balanceCOP = response.balanceInCop || 0;
      this.balanceUSD = response.balanceInUsd || '0.00';
    } catch {
      this.balanceUSD = 'N/A';
      this.balanceCOP = 0;
    }
  }

  // ─── API: Get Referral Link ─────────────────────────
  async getReferralLink(): Promise<void> {
    const url = `${environment.apiUrl}/User/GetLink/${this.username}`;
    try {
      const response: any = await firstValueFrom(this.http.get(url));
      this.referralLink = response.link || '';
    } catch (error: any) {
      console.error('Error al obtener link de referido:', error);
    }
  }

  // ─── API: Get History ────────────────────────────────
  async loadHistory(): Promise<void> {
    this.historyLoading = true;
    const url = `${environment.apiUrl}/Wallet/History/${this.username}`;
    try {
      const response: any = await firstValueFrom(this.http.get(url));
      // API returns a flat array with type field ('deposit' | 'withdrawal')
      const all: any[] = Array.isArray(response) ? response : [];
      this.depositHistory = all
        .filter((t) => t.type === 'deposit')
        .map((t) => this.mapTx(t, 'deposit'));
      this.withdrawHistory = all
        .filter((t) => t.type === 'withdrawal')
        .map((t) => this.mapTx(t, 'withdraw'));
      this.historyLoaded = true;
    } catch {
      this.depositHistory = [];
      this.withdrawHistory = [];
      this.historyLoaded = true;
    } finally {
      this.historyLoading = false;
    }
  }

  private mapTx(raw: any, type: 'deposit' | 'withdraw'): TxItem {
    const statusRaw = (raw.status || '').toLowerCase();
    const isApproved = statusRaw === 'éxito' || statusRaw === 'completado' || statusRaw === 'approved';
    return {
      title: raw.title || (type === 'deposit' ? 'Depósito de Fondos' : 'Retiro Solicitado'),
      status: isApproved ? 'approved' : 'pending',
      from: type === 'deposit' ? this.extractTokenFromTitle(raw.title) : 'Cartera Principal',
      to: type === 'deposit' ? 'Cartera Principal' : 'Cuenta externa',
      date: raw.date || 'N/A',
      amountSent: raw.signedAmount || `${type === 'deposit' ? '+' : '-'} ${(raw.amount || 0).toLocaleString('es-CO')} COP`,
      amountReceived: raw.netAmount
        ? `${raw.netAmount.toLocaleString('es-CO')} COP`
        : `${(raw.amount || 0).toLocaleString('es-CO')} COP`,
      receivedColor: type === 'deposit' ? 'var(--success)' : 'var(--danger)',
    };
  }

  private extractTokenFromTitle(title: string): string {
    if (!title) return 'Recarga';
    // Titles like "Recarga Nequi", "Recarga Usdt_trc20", etc.
    const parts = title.split(' ');
    if (parts.length > 1) {
      return parts.slice(1).join(' ');
    }
    return title;
  }

  // ─── API: Get Account Details ───────────────────────
  async getAccountDetails(): Promise<void> {
    const url = `${environment.apiUrl}/Wallet/GetAccountSummary/${this.username}`;
    try {
      const response: any = await firstValueFrom(this.http.get(url));
      this.accountDetails = {
        yesterday: response.yesterday || '0',
        today: response.today || '0',
        month: response.month || '0',
        team: response.team || '0',
        total: response.total || '0',
      };
    } catch {
      this.accountDetails = { yesterday: '0', today: '0', month: '0', team: '0', total: '0' };
    }
  }

  // ─── API: Submit Password Change ────────────────────
  async submitPassword(): Promise<void> {
    if (!this.passFormValid || this.submitting) return;
    this.submitting = true;
    const oldPassword = this.passForm.get('oldPassword')?.value;
    const newPassword = this.passForm.get('newPassword')?.value;
    try {
      const response: any = await firstValueFrom(
        this.http.patch(`${environment.apiUrl}/User/UpdatePassword`, {
          Username: this.username,
          OldPassword: oldPassword,
          NewPassword: newPassword,
        }, { observe: 'response' })
      );
      if (response.status === 200) {
        this.notification.correct(response.body?.message || 'Contraseña actualizada correctamente');
        this.switchView('main');
      } else {
        throw new Error('Error inesperado');
      }
    } catch (error: any) {
      const message = error?.error?.message || error?.message || 'Error al actualizar la contraseña';
      this.notification.errorMessage(message);
    } finally {
      this.submitting = false;
    }
  }

  // ─── API: Submit Withdraw Password Change ────────────
  async submitWithdrawPassword(): Promise<void> {
    if (!this.withdrawPassFormValid || this.submitting) return;
    this.submitting = true;
    const oldWithdrawPassword = this.withdrawPassForm.get('oldWithdrawPassword')?.value;
    const newWithdrawPassword = this.withdrawPassForm.get('newWithdrawPassword')?.value;
    try {
      const response: any = await firstValueFrom(
        this.http.patch(`${environment.apiUrl}/User/SetWithdrawPassword`, {
          Username: this.username,
          OldWithdrawPassword: oldWithdrawPassword,
          NewWithdrawPassword: newWithdrawPassword,
        }, { observe: 'response' })
      );
      if (response.status === 200) {
        this.notification.correct(response.body?.message || 'Contraseña de retiro actualizada correctamente');
        this.switchView('main');
      } else {
        throw new Error('Error inesperado');
      }
    } catch (error: any) {
      const message = error?.error?.message || error?.message || 'Error al actualizar la contraseña de retiro';
      this.notification.errorMessage(message);
    } finally {
      this.submitting = false;
    }
  }

  // ─── API: Submit Phone Change ───────────────────────
  async submitPhone(): Promise<void> {
    if (!this.phoneFormValid || this.submitting) return;
    this.submitting = true;
    const oldPhone = this.phoneForm.get('oldPhone')?.value;
    const newPhone = this.phoneForm.get('newPhone')?.value;
    try {
      const response: any = await firstValueFrom(
        this.http.patch(`${environment.apiUrl}/User/UpdatePhoneNumber`, {
          Username: this.username,
          OldPhoneNumber: `+57${oldPhone}`,
          NewPhoneNumber: `+57${newPhone}`,
        }, { observe: 'response' })
      );
      if (response.status === 200) {
        this.notification.correct(response.body?.message || 'Número actualizado correctamente');
        this.switchView('main');
      } else {
        throw new Error('Error inesperado');
      }
    } catch (error: any) {
      const message = error?.error?.message || error?.message || 'Error al actualizar el número';
      this.notification.errorMessage(message);
    } finally {
      this.submitting = false;
    }
  }

  // ─── API: Logout ─────────────────────────────────────
  async logout(): Promise<void> {
    const url = `${environment.apiUrl}/User/Logout/${this.username}`;
    try {
      const response: any = await firstValueFrom(this.http.get(url));
      localStorage.removeItem('username');
      localStorage.removeItem('token');
      this.notification.correct(response.message || 'Sesión cerrada correctamente');
      setTimeout(() => this.router.navigate(['/login']), 3000);
    } catch {
      localStorage.removeItem('username');
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    }
  }

  // ─── Copy Referral Link ───────────────────────────────
  async copyReferralLink(): Promise<void> {
    if (!this.referralLink) {
      await this.getReferralLink();
    }
    if (this.referralLink) {
      try {
        await navigator.clipboard.writeText(this.referralLink);
        this.notification.correct('Link copiado al portapapeles');
      } catch {
        const textArea = document.createElement('textarea');
        textArea.value = this.referralLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.notification.correct('Link copiado al portapapeles');
      }
    } else {
      this.notification.errorMessage('No se pudo obtener el link de referido');
    }
  }

  // ─── Captcha ─────────────────────────────────────────
  private generateCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}
