import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ThemeService } from '../../services/theme.service';
import { NotificationService } from '../../services/products/notification.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

interface ChatMessage {
  type: 'system' | 'user';
  text?: string;
  image?: string;
  meta?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private router = inject(Router);
  themeService = inject(ThemeService);
  private sanitizer = inject(DomSanitizer);
  private http = inject(HttpClient);
  private notification = inject(NotificationService);

  username = localStorage.getItem('username') || '';

  // Profile state
  profileName = 'Alex Trader Premium';
  profileUid = '84729104';
  avatarImage: string | null = null;
  isKycVerified = false;
  hasWithdrawalPwd = false;
  withdrawalPasswordValue = '';
  kycStatusText = 'Verificación requerida';
  nequiBtnText = 'Agregar retiro guardado';
  kycBtnText = 'Verificación de identidad';

  // KYC form
  kycName = '';
  kycAge = '';
  kycCountry = '';
  kycCity = '';
  kycDocType = 'Cédula';
  kycDocNumber = '';
  kycDocLabel = 'Número de Cédula';
  kycDocPlaceholder = 'Ingresa tu número de cédula';
  kycWindowOpen = false;
  kycLoading = false;
  kycCountdown = 3;

  // Withdrawal password
  withdrawalPwdWindowOpen = false;
  withdrawalPwdInput = '';
  withdrawalPwdOldInput = '';
  withdrawalPwdTitleHeader = 'Definir Clave de Retiro';
  withdrawalPwdMainTitle = 'Nueva Contraseña de Retiro';
  withdrawalPwdLabel = 'Nueva Contraseña (4 caracteres)';
  ActiveDays=0;
  // Account password
  accountPwdWindowOpen = false;
  accOldPwd = '';
  accNewPwd = '';
  accRepeatPwd = '';

  // Withdrawal methods
  nequiWindowOpen = false;
  activeFormType = '';
  nequiSaved = false;
  usdtSaved = false;
  usdtBepSaved = false;
  nequiNumberInput = '';
  usdtAddressInput = '';
  usdtBepAddressInput = '';

  // Chat
  chatWindowOpen = false;
  chatInput = '';
  chatMessages: ChatMessage[] = [
    {
      type: 'system',
      text: 'Hola, soy tu asesor financiero de TradingView. ¿En qué puedo ayudarte con tus balances u operaciones hoy?',
    },
  ];

  // Theme
  get themeBtnText(): string {
    return this.themeService.getTheme() === 'dark'
      ? 'Modo oscuro (Toque para cambiar)'
      : 'Modo claro (Toque para cambiar)';
  }

  async ngOnInit(): Promise<void> {
    this.updateDocumentPlaceholder();
    await this.checkIsVerified();
    await this.checkHasWithdrawPassword();
    await this.LoadProfile();
  }
  async LoadProfile(): Promise<void> {
    if (!this.username) return;
    try {
      const response: any = await firstValueFrom(
        this.http.post(
          `${environment.apiUrl}/User/UserInfo`,
          {Username:this.username}
        )
      );
      this.profileName = response?.profile.profileName || "Anonimo";
      this.ActiveDays=response?.activeDays;
    } catch (error: any) {
      console.error('Error ', error);
      this.profileName= "Anonimo";
    }
  }

  async checkHasWithdrawPassword(): Promise<void> {
    if (!this.username) return;
    try {
      const response: any = await firstValueFrom(
        this.http.get(
          `${environment.apiUrl}/User/HasWithdrawPassword/${this.username}`
        )
      );
      this.hasWithdrawalPwd = response?.hasWithdrawPassword || false;
    } catch (error: any) {
      console.error('Error al verificar contraseña de retiro:', error);
      this.hasWithdrawalPwd = false;
    }
  }
  async checkIsVerified(): Promise<void> {
    if (!this.username) return;
    try {
      const response: any = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/User/IsVerified/${this.username}`)
      );
      this.isKycVerified = response?.isKycVerified || false;
    } catch (error: any) {
      console.error('Error al verificar KYC', error);
      this.hasWithdrawalPwd = false;
    }
  }

  // ─── Navigation ───────────────────────────
  goToDeposit(): void {
    this.router.navigate(['/recharge']);
  }

  goToWithdraw(): void {
    this.router.navigate(['/withdrawToken']);
  }

  goToReferrals(): void {
    this.router.navigate(['/team']);
  }

  // ─── Profile ────────────────────────────
  async editProfileName(): Promise<void> {
    const currentName = this.profileName;
    const newName = prompt('Introduce tu nuevo nombre de perfil:', currentName);
    if (newName && newName.trim() !== '') {
      this.profileName = newName.trim();

      const body = {
        Username: this.username,
        Name: newName.trim(),
      };
      try {
        const response: any = await firstValueFrom(
          this.http.post(`${environment.apiUrl}/User/SetName`, body)
        );
      } catch (error: any) {
        const message =
          error?.error?.message ||
          error?.message ||
          'Error al cargar los datos';
        this.notification.errorMessage(
          typeof message === 'string' ? message : 'Error al cargar los datos'
        );
        return;
      }
    }
  }

  updateProfileAvatar(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.avatarImage = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  copyUid(): void {
    alert('UID Copiado');
  }

  // ─── KYC ──────────────────────────────────
  updateDocumentPlaceholder(): void {
    if (this.kycDocType === 'Cédula') {
      this.kycDocLabel = 'Número de Cédula';
      this.kycDocPlaceholder = 'Ingresa tu número de cédula';
    } else if (this.kycDocType === 'Pasaporte') {
      this.kycDocLabel = 'Número de Pasaporte';
      this.kycDocPlaceholder = 'Ingresa tu número de pasaporte';
    } else if (this.kycDocType === 'Licencia') {
      this.kycDocLabel = 'Número de Licencia';
      this.kycDocPlaceholder = 'Ingresa tu número de licencia';
    }
  }

  openKycWindow(): void {
    if (this.isKycVerified) return;
    this.kycWindowOpen = true;
  }

  closeKycWindow(): void {
    this.kycWindowOpen = false;
    this.kycLoading = false;
    this.kycCountdown = 3;
  }

  async startKycAiVerification(): Promise<void> {
    console.log('Iniciando verificación KYC con IA...');
    if (
      !this.kycName.trim() ||
      !this.kycCountry.trim() ||
      !this.kycCity.trim() ||
      !this.kycDocNumber.trim()
    ) {
      alert('Por favor llena todos los campos obligatorios del documento.');
      return;
    }

    this.kycLoading = true;
    let count = 3;
    const body = {
      Username: this.username,
      RealName: this.kycName,
      Age: this.kycAge,
      Country: this.kycCountry,
      City: this.kycCity,
      DocumentType: this.kycDocType,
      DocumentNumber: this.kycDocNumber,
    };
    try {
      const response: any = await firstValueFrom(
        this.http.post(`${environment.apiUrl}/User/SetProfile`, body)
      );
    } catch (error: any) {
      const message =
        error?.error?.message || error?.message || 'Error al cargar los datos';
      this.notification.errorMessage(
        typeof message === 'string' ? message : 'Error al cargar los datos'
      );
      return;
    }
    const interval = setInterval(() => {
      count--;
      this.kycCountdown = count;
      if (count === 0) {
        clearInterval(interval);
        this.finalizeKycSuccess();
      }
    }, 1000);
  }

  finalizeKycSuccess(): void {
    this.isKycVerified = true;
    this.kycBtnText = 'Verificado El KYC';
    this.kycStatusText = 'Verificado (KYC Pasado)';
    this.kycWindowOpen = false;
    this.kycLoading = false;
    alert('¡Verificación aprobada automáticamente por la IA!');
  }

  // ─── Withdrawal Password ──────────────────
  openWithdrawalPwdWindow(): void {
    if (this.hasWithdrawalPwd) {
      this.withdrawalPwdTitleHeader = 'Editar Clave de Retiro';
      this.withdrawalPwdMainTitle = 'Editar Contraseña de Retiro Actual';
      this.withdrawalPwdLabel = 'Introduce la nueva contraseña (4 caracteres)';
    }
    this.withdrawalPwdInput = '';
    this.withdrawalPwdWindowOpen = true;
  }

  closeWithdrawalPwdWindow(): void {
    this.withdrawalPwdWindowOpen = false;
  }

  async saveWithdrawalPassword(): Promise<void> {
    if (this.withdrawalPwdInput.length !== 4) {
      alert('La contraseña de retiro debe tener exactamente 4 caracteres.');
      return;
    }
    if (!/^[0-9]+$/.test(this.withdrawalPwdInput)) {
      alert('La contraseña de retiro solo puede contener números.');
      return;
    }
    try {
      const response: any = await firstValueFrom(
        this.http.patch(
          `${environment.apiUrl}/User/SetWithdrawPassword`,
          {
            Username: this.username,
            OldWithdrawPassword: this.hasWithdrawalPwd
              ? this.withdrawalPwdOldInput
              : '',
            NewWithdrawPassword: this.withdrawalPwdInput,
          },
          { observe: 'response' }
        )
      );
      if (response.status === 200) {
        this.withdrawalPasswordValue = this.withdrawalPwdInput;
        this.hasWithdrawalPwd = true;
        this.notification.correct(
          'Contraseña de retiro guardada correctamente'
        );
        this.closeWithdrawalPwdWindow();
      } else {
        throw new Error('Error inesperado');
      }
    } catch (error: any) {
      const message =
        error?.error?.message ||
        error?.message ||
        'Error al guardar la contraseña de retiro';
      this.notification.errorMessage(
        typeof message === 'string'
          ? message
          : 'Error al guardar la contraseña de retiro'
      );
    }
  }

  // ─── Account Password ─────────────────────
  openAccountPwdWindow(): void {
    this.accOldPwd = '';
    this.accNewPwd = '';
    this.accRepeatPwd = '';
    this.accountPwdWindowOpen = true;
  }

  closeAccountPwdWindow(): void {
    this.accountPwdWindowOpen = false;
  }

  async saveAccountPassword(): Promise<void> {
    if (!this.accOldPwd || !this.accNewPwd || !this.accRepeatPwd) {
      alert('Por favor rellene todos los campos requeridos.');
      return;
    }
    if (this.accNewPwd !== this.accRepeatPwd) {
      alert('La nueva contraseña y su repetición no coinciden.');
      return;
    }
    if (this.accNewPwd.length < 6) {
      alert('La nueva contraseña debe tener mínimo 6 caracteres.');
      return;
    }
    try {
      const response: any = await firstValueFrom(
        this.http.patch(
          `${environment.apiUrl}/User/UpdatePassword`,
          {
            Username: this.username,
            OldPassword: this.accOldPwd,
            NewPassword: this.accNewPwd,
          },
          { observe: 'response' }
        )
      );
      if (response.status === 200) {
        this.notification.correct(
          'Contraseña de la cuenta actualizada exitosamente'
        );
        this.closeAccountPwdWindow();
      } else {
        throw new Error('Error inesperado');
      }
    } catch (error: any) {
      const message =
        error?.error?.message ||
        error?.message ||
        'Error al actualizar la contraseña';
      this.notification.errorMessage(
        typeof message === 'string'
          ? message
          : 'Error al actualizar la contraseña'
      );
    }
  }

  // ─── Withdrawal Methods ───────────────────
  openNequiWindow(): void {
    this.activeFormType = '';
    this.nequiNumberInput = '';
    this.usdtAddressInput = '';
    this.usdtBepAddressInput = '';
    this.nequiWindowOpen = true;
  }

  closeNequiWindow(): void {
    this.nequiWindowOpen = false;
  }

  switchMethodForm(type: string): void {
    this.activeFormType = type;
  }

  get liveCardPreview(): SafeHtml {
    let html = '';
    if (this.activeFormType === 'nequi') {
      const val = this.nequiNumberInput || '3000000000';
      const badgeClass = this.nequiSaved
        ? 'badge-saved-success'
        : 'badge-nequi';
      const badgeText = this.nequiSaved ? '✓ GUARDADO' : 'NEQUI PENDIENTE';
      html = `
        <div class="nequi-card-display">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div class="nequi-logo-text">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3fe3ff" stroke-width="2.5" style="margin-right:2px;"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
              NEQUI<span class="nequi-logo-dot"></span>
            </div>
            <span class="card-status-badge ${badgeClass}">${badgeText}</span>
          </div>
          <div class="nequi-card-number">*** *** ${val.slice(-4)}</div>
          <div>
            <div class="nequi-card-lbl">Número Vinculado</div>
            <div style="font-size:15px; font-weight:600; letter-spacing:1px;">${val}</div>
          </div>
        </div>
      `;
    } else if (this.activeFormType === 'usdt') {
      const val = this.usdtAddressInput || 'TXa1b2c3d4e5f6g7h8i9j0xxxxxxxx';
      const badgeClass = this.usdtSaved
        ? 'badge-saved-success'
        : 'badge-usdt-trc';
      const badgeText = this.usdtSaved ? '✓ GUARDADO' : 'TRC20 CONFIGURANDO';
      html = `
        <div class="usdt-card-display usdt-trc-gradient">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div class="nequi-logo-text" style="color: #ffffff; font-size:20px;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2eff8b" stroke-width="2.5" style="margin-right:4px;"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v12M9 8h6M9 12h6"></path></svg>
              USDT
            </div>
            <span class="card-status-badge ${badgeClass}">${badgeText}</span>
          </div>
          <div class="usdt-card-number" style="font-size:14px; letter-spacing:0.5px;">${val.slice(
            0,
            8
          )}...${val.slice(-8)}</div>
          <div>
            <div class="usdt-card-lbl">Dirección Cripto TRC20 Registrada</div>
            <div style="font-size:12px; font-weight:500; opacity:0.9; word-break:break-all;">${val}</div>
          </div>
        </div>
      `;
    } else if (this.activeFormType === 'usdt-bep') {
      const val =
        this.usdtBepAddressInput || '0x71Cxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
      const badgeClass = this.usdtBepSaved
        ? 'badge-saved-success'
        : 'badge-usdt-bep';
      const badgeText = this.usdtBepSaved ? '✓ GUARDADO' : 'BEP20 CONFIGURANDO';
      html = `
        <div class="usdt-card-display usdt-bep-gradient">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div class="nequi-logo-text" style="color: #ffffff; font-size:20px;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffd269" stroke-width="2.5" style="margin-right:4px;"><path d="M12 2l5 5-5 5-5-5zM12 12l5 5-5 5-5-5zM6 8l4 4-4 4-4-4zM18 8l4 4-4 4-4-4z"></path></svg>
              USDT
            </div>
            <span class="card-status-badge ${badgeClass}">${badgeText}</span>
          </div>
          <div class="usdt-card-number" style="font-size:14px; letter-spacing:0.5px;">${val.slice(
            0,
            8
          )}...${val.slice(-8)}</div>
          <div>
            <div class="usdt-card-lbl">Dirección Cripto BEP20 Registrada</div>
            <div style="font-size:12px; font-weight:500; opacity:0.9; word-break:break-all;">${val}</div>
          </div>
        </div>
      `;
    }
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  saveNequiAccount(): void {
    const nequiNum = this.nequiNumberInput.trim();
    if (!nequiNum || nequiNum.length < 8) {
      alert('Por favor introduce un número de cuenta Nequi válido.');
      return;
    }
    this.nequiSaved = true;
    this.nequiBtnText = 'Editar retiro guardado';
    alert('Método de retiro Nequi guardado exitosamente.');
  }

  saveUsdtAccount(): void {
    const usdtAddr = this.usdtAddressInput.trim();
    if (!usdtAddr || usdtAddr.length < 20) {
      alert('Por favor introduce una dirección de billetera USDT válida.');
      return;
    }
    this.usdtSaved = true;
    this.nequiBtnText = 'Editar retiro guardado';
    alert('Billetera USDT TRC20 vinculada exitosamente.');
  }

  saveUsdtBepAccount(): void {
    const usdtBepAddr = this.usdtBepAddressInput.trim();
    if (!usdtBepAddr || usdtBepAddr.length < 20) {
      alert('Por favor introduce una dirección de billetera BEP20 válida.');
      return;
    }
    this.usdtBepSaved = true;
    this.nequiBtnText = 'Editar retiro guardado';
    alert('Billetera USDT BEP20 vinculada exitosamente.');
  }

  // ─── Chat ─────────────────────────────────
  toggleChat(): void {
    this.chatWindowOpen = !this.chatWindowOpen;
  }

  sendMessage(): void {
    const text = this.chatInput.trim();
    if (!text) return;
    this.chatMessages.push({ type: 'user', text });
    this.chatInput = '';
    setTimeout(() => {
      const reply: ChatMessage = {
        type: 'system',
        text: `Recibido. Un asesor de cuentas premium tomará tu ticket de inmediato. ID: #TV-${Math.floor(
          1000 + Math.random() * 9000
        )}`,
      };
      this.chatMessages.push(reply);
    }, 1000);
  }

  onChatKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  handleMediaSelection(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const image = e.target?.result as string;
      this.chatMessages.push({
        type: 'user',
        image,
        meta: 'Imagen seleccionada',
      });
      input.value = '';
      setTimeout(() => {
        this.chatMessages.push({
          type: 'system',
          text: 'Captura recibida con éxito. El departamento técnico está revisando los detalles del archivo.',
        });
      }, 1200);
    };
    reader.readAsDataURL(file);
  }

  // ─── Theme ────────────────────────────────
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  // ─── Logout ───────────────────────────────
  closeSessionAction(): void {
    if (confirm('¿Estás seguro de que quieres cerrar sección?')) {
      alert('Sesión finalizada.');
      this.router.navigate(['/login']);
    }
  }
}
