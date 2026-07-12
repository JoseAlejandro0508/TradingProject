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
  ActiveDays = 0;
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
  nequiNumberSaved = '';
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
    await this.getSavedAccount();
    this.LoadState();
  }
  LoadState(): void {
    const navState = history.state;

    const SelectedSection=navState.sectionOpen||null;

    if(!SelectedSection) {
      return
    }else if(SelectedSection==='ChangePass'){
      this.openAccountPwdWindow();
    }else if(SelectedSection==='ChangeWithdrawPass'){
      this.openWithdrawalPwdWindow();
    }else if(SelectedSection==='KYC'){

      this.openKycWindow();
    }else if(SelectedSection==='Nequi'){
      this.openNequiWindow();
    }


  }
  async LoadProfile(): Promise<void> {
    if (!this.username) return;
    try {
      const response: any = await firstValueFrom(
        this.http.post(`${environment.apiUrl}/User/UserInfo`, {
          Username: this.username,
        })
      );
      this.profileName = response?.profile.profileName || 'Anonimo';
      this.ActiveDays = response?.activeDays;
    } catch (error: any) {
      console.error('Error ', error);
      this.profileName = 'Anonimo';
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
    this.router.navigate(['/deposit/nequi']);
  }

  goToWithdraw(): void {
    this.router.navigate(['/withdraw/nequi']);
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
  async openNequiWindow(): Promise<void> {
    this.activeFormType = '';
    this.nequiNumberInput = '';
    this.usdtAddressInput = '';
    this.usdtBepAddressInput = '';
    this.nequiWindowOpen = true;
    await this.getSavedAccount();
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
      const val = String(this.nequiNumberSaved || '3000000000').trim();
      const badgeClass = this.nequiSaved
        ? 'badge-saved-success'
        : 'badge-nequi';
      const badgeText = this.nequiSaved ? '✓ GUARDADO' : 'NEQUI PENDIENTE';
      html = `

        <style>
        
          .method-selector-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}

.method-select-card {
  background: var(--input-bg);
  border: 2px solid var(--border-color);
  border-radius: 14px;
  padding: 12px 6px;
  text-align: center;
  cursor: pointer;
  font-weight: 700;
  font-size: 12px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.method-select-card .method-icon-wrapper {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.method-select-card.active-nequi {
  border-color: #da0077;
  background: rgba(218, 0, 119, 0.05);
}

.method-select-card.active-usdt {
  border-color: var(--usdt-brand);
  background: rgba(0, 147, 147, 0.05);
}

.method-select-card.active-usdt-bep {
  border-color: #f3ba2f;
  background: rgba(243, 186, 47, 0.05);
}

/* --- TARJETAS GRANDES DE RETIRO --- */
.saved-cards-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
}

.nequi-card-display {
  width: 100%;
  background: linear-gradient(135deg, #da0077 0%, #1c003a 100%);
  border-radius: 20px;
  padding: 24px;
  position: relative;
  color: #ffffff;
  box-shadow: 0 12px 28px rgba(218, 0, 119, 0.25);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 190px;
  margin-top: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.nequi-card-display::before,
.usdt-card-display::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -20%;
  width: 250px;
  height: 250px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 50%;
  pointer-events: none;
}

.nequi-logo-text {
  font-weight: 900;
  font-size: 24px;
  letter-spacing: -1px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.nequi-logo-dot {
  width: 8px;
  height: 8px;
  background: #3fe3ff;
  border-radius: 50%;
  display: inline-block;
}

.nequi-card-number,
.usdt-card-number {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 3px;
  margin: 20px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  word-break: break-all;
}

.nequi-card-lbl,
.usdt-card-lbl {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.7;
  margin-bottom: 2px;
}

/* DISEÑO DE LA TARJETA USDT */
.usdt-card-display {
  width: 100%;
  border-radius: 20px;
  padding: 24px;
  position: relative;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 190px;
  margin-top: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.usdt-trc-gradient {
  background: linear-gradient(135deg, #009393 0%, #061826 100%);
  box-shadow: 0 12px 28px rgba(0, 147, 147, 0.25);
}

.usdt-bep-gradient {
  background: linear-gradient(135deg, #f3ba2f 0%, #11141a 100%);
  box-shadow: 0 12px 28px rgba(243, 186, 47, 0.2);
}

        </style>
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
      const val = String(
        this.usdtAddressInput || 'TXa1b2c3d4e5f6g7h8i9j0xxxxxxxx'
      ).trim();
      const badgeClass = this.usdtSaved
        ? 'badge-saved-success'
        : 'badge-usdt-trc';
      const badgeText = this.usdtSaved ? '✓ GUARDADO' : 'TRC20 CONFIGURANDO';
      html = `
              <style>
        
          .method-selector-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}

.method-select-card {
  background: var(--input-bg);
  border: 2px solid var(--border-color);
  border-radius: 14px;
  padding: 12px 6px;
  text-align: center;
  cursor: pointer;
  font-weight: 700;
  font-size: 12px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.method-select-card .method-icon-wrapper {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.method-select-card.active-nequi {
  border-color: #da0077;
  background: rgba(218, 0, 119, 0.05);
}

.method-select-card.active-usdt {
  border-color: var(--usdt-brand);
  background: rgba(0, 147, 147, 0.05);
}

.method-select-card.active-usdt-bep {
  border-color: #f3ba2f;
  background: rgba(243, 186, 47, 0.05);
}

/* --- TARJETAS GRANDES DE RETIRO --- */
.saved-cards-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
}

.nequi-card-display {
  width: 100%;
  background: linear-gradient(135deg, #da0077 0%, #1c003a 100%);
  border-radius: 20px;
  padding: 24px;
  position: relative;
  color: #ffffff;
  box-shadow: 0 12px 28px rgba(218, 0, 119, 0.25);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 190px;
  margin-top: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.nequi-card-display::before,
.usdt-card-display::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -20%;
  width: 250px;
  height: 250px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 50%;
  pointer-events: none;
}

.nequi-logo-text {
  font-weight: 900;
  font-size: 24px;
  letter-spacing: -1px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.nequi-logo-dot {
  width: 8px;
  height: 8px;
  background: #3fe3ff;
  border-radius: 50%;
  display: inline-block;
}

.nequi-card-number,
.usdt-card-number {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 3px;
  margin: 20px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  word-break: break-all;
}

.nequi-card-lbl,
.usdt-card-lbl {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.7;
  margin-bottom: 2px;
}

/* DISEÑO DE LA TARJETA USDT */
.usdt-card-display {
  width: 100%;
  border-radius: 20px;
  padding: 24px;
  position: relative;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 190px;
  margin-top: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.usdt-trc-gradient {
  background: linear-gradient(135deg, #009393 0%, #061826 100%);
  box-shadow: 0 12px 28px rgba(0, 147, 147, 0.25);
}

.usdt-bep-gradient {
  background: linear-gradient(135deg, #f3ba2f 0%, #11141a 100%);
  box-shadow: 0 12px 28px rgba(243, 186, 47, 0.2);
}

        </style>
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
      const val = String(
        this.usdtBepAddressInput || '0x71Cxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
      ).trim();
      const badgeClass = this.usdtBepSaved
        ? 'badge-saved-success'
        : 'badge-usdt-bep';
      const badgeText = this.usdtBepSaved ? '✓ GUARDADO' : 'BEP20 CONFIGURANDO';
      html = `
              <style>
        
          .method-selector-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}

.method-select-card {
  background: var(--input-bg);
  border: 2px solid var(--border-color);
  border-radius: 14px;
  padding: 12px 6px;
  text-align: center;
  cursor: pointer;
  font-weight: 700;
  font-size: 12px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.method-select-card .method-icon-wrapper {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.method-select-card.active-nequi {
  border-color: #da0077;
  background: rgba(218, 0, 119, 0.05);
}

.method-select-card.active-usdt {
  border-color: var(--usdt-brand);
  background: rgba(0, 147, 147, 0.05);
}

.method-select-card.active-usdt-bep {
  border-color: #f3ba2f;
  background: rgba(243, 186, 47, 0.05);
}

/* --- TARJETAS GRANDES DE RETIRO --- */
.saved-cards-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
}

.nequi-card-display {
  width: 100%;
  background: linear-gradient(135deg, #da0077 0%, #1c003a 100%);
  border-radius: 20px;
  padding: 24px;
  position: relative;
  color: #ffffff;
  box-shadow: 0 12px 28px rgba(218, 0, 119, 0.25);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 190px;
  margin-top: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.nequi-card-display::before,
.usdt-card-display::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -20%;
  width: 250px;
  height: 250px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 50%;
  pointer-events: none;
}

.nequi-logo-text {
  font-weight: 900;
  font-size: 24px;
  letter-spacing: -1px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.nequi-logo-dot {
  width: 8px;
  height: 8px;
  background: #3fe3ff;
  border-radius: 50%;
  display: inline-block;
}

.nequi-card-number,
.usdt-card-number {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 3px;
  margin: 20px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  word-break: break-all;
}

.nequi-card-lbl,
.usdt-card-lbl {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.7;
  margin-bottom: 2px;
}

/* DISEÑO DE LA TARJETA USDT */
.usdt-card-display {
  width: 100%;
  border-radius: 20px;
  padding: 24px;
  position: relative;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 190px;
  margin-top: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.usdt-trc-gradient {
  background: linear-gradient(135deg, #009393 0%, #061826 100%);
  box-shadow: 0 12px 28px rgba(0, 147, 147, 0.25);
}

.usdt-bep-gradient {
  background: linear-gradient(135deg, #f3ba2f 0%, #11141a 100%);
  box-shadow: 0 12px 28px rgba(243, 186, 47, 0.2);
}

        </style>
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

  async getSavedAccount(): Promise<void> {
    try {
      const response: any = await firstValueFrom(
        this.http.get(
          `${environment.apiUrl}/User/GetWithdrawAccount/${this.username}`
        )
      );
      if (response?.accountNumber) {
        this.nequiSaved = true;
        this.nequiBtnText = 'Editar retiro guardado';
        this.nequiNumberSaved = response.accountNumber;
      } else {
        this.nequiSaved = false;
      }
    } catch (error: any) {
      this.nequiSaved = false;
      console.warn('No hay cuenta Nequi guardada', error?.error?.message);
    }
  }
  async saveNequiAccount(): Promise<void> {
    const nequiNum = String(this.nequiNumberInput || '').trim();
    console.log('Guardando cuenta Nequi:', nequiNum.length);
    if (!nequiNum || nequiNum.length < 8) {
      alert('Por favor introduce un número de cuenta Nequi válido.');
      return;
    }
    try {
      const response: any = await firstValueFrom(
        this.http.post(`${environment.apiUrl}/User/SetWithrawAccount`, {
          Phone: this.username,
          AccountNumber: nequiNum,
        })
      );

      this.nequiSaved = true;
      this.nequiNumberSaved = nequiNum;
      this.nequiBtnText = 'Editar retiro guardado';
      alert('Método de retiro Nequi guardado exitosamente.');
    } catch (error: any) {
      alert('Error inesperado');
    }
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
