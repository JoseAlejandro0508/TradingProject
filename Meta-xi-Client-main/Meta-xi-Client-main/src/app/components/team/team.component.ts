import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

interface LatestReferral {
  name: string;
  initials: string;
  dateInfo: string;
  level: number;
}

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss',
})
export class TeamComponent implements OnInit {
  username: string = localStorage.getItem('username') || '';

  // ─── Referral ────────────────────────────────────
  referralCode: string = '...';
  referralLink: string = '...';
  codeCopied = false;
  linkCopied = false;

  // ─── Team Stats ─────────────────────────────────
  teamSize = 0;
  newTeamToday = 0;
  teamRecharge = 0;
  teamWithdraw = 0;

  // ─── Level Data ─────────────────────────────────
  lvl1Register = 0;
  lvl1Income = 0;
  lvl2Register = 0;
  lvl2Income = 0;
  lvl3Register = 0;
  lvl3Income = 0;
  lvl4Income = 0;
  totalIncome = 0;

  // ─── Accordion ──────────────────────────────────
  accordionOpen: string | null = null;
  referidosContentHeight = 500;
  detallesContentHeight = 500;
  gananciasContentHeight = 500;

  // ─── Toast ──────────────────────────────────────
  toastVisible = false;
  toastMessage = 'Copiado con éxito';

  // ─── Latest Referrals (mock data until API available) ─
  latestReferrals: LatestReferral[] = [];
  
  constructor(private http: HttpClient) {}

  ngOnInit(): void {

    this.loadReferralData();
    this.loadLevelData();
    this.loadLatestRefers();
  }
  
  // ─── API: Referral latest Refers ──────────────────
  private async loadLatestRefers(): Promise<void> {
    const url = `${environment.apiUrl}/Refer/LatestRefers/${this.username}`;
    try {
      const response: any = await firstValueFrom(this.http.get(url));
      response.forEach((element: LatestReferral) => {
        this.latestReferrals.push(element);
      });
      this.referralCode = this.extractCodeFromUrl(this.referralLink);
    } catch (error: any) {
      console.error('Error al obtener datos de referido:', error);
      this.referralCode = '---';
      this.referralLink = '---';
    }
  }

  // ─── API: Referral Link & Code ──────────────────
  private async loadReferralData(): Promise<void> {
    const url = `${environment.apiUrl}/User/GetLink/${this.username}`;
    try {
      const response: any = await firstValueFrom(this.http.get(url));
      this.referralLink = response.link || '';
      this.referralCode = this.extractCodeFromUrl(this.referralLink);
    } catch (error: any) {
      console.error('Error al obtener datos de referido:', error);
      this.referralCode = '---';
      this.referralLink = '---';
    }
  }

  private extractCodeFromUrl(url: string): string {
    try {
      const urlParams = new URL(url).searchParams;
      return urlParams.get('code') || '';
    } catch {
      return '';
    }
  }

  // ─── API: Level Data ────────────────────────────
  private async loadLevelData(): Promise<void> {
    const url = `${environment.apiUrl}/Refer/GetReferrer/${this.username}`;
    try {
      const response: any = await firstValueFrom(this.http.get(url));
      this.lvl1Register = response.countLVL1 || 0;
      this.lvl1Income = response.earnLVL1 || 0;
      this.lvl2Register = response.countLVL2 || 0;
      this.lvl2Income = response.earnLVL2 || 0;
      this.lvl3Register = response.countLVL3 || 0;
      this.lvl3Income = response.earnLVL3 || 0;
      this.lvl4Income = response.earnLVL4 || 0;
      this.totalIncome = this.lvl1Income + this.lvl2Income + this.lvl3Income + this.lvl4Income;
      this.teamSize = response.countTotal || 0;
      this.newTeamToday = response.countToday || 0;
      this.teamRecharge = response.teamRecharge || 0;
      this.teamWithdraw = response.teamWithdraw || 0;
    } catch (error: any) {
      console.error('Error al obtener datos de niveles:', error);
    }
  }

  // ─── Accordion ──────────────────────────────────
  toggleAccordion(name: string): void {
    if (this.accordionOpen === name) {
      this.accordionOpen = null;
    } else {
      this.accordionOpen = name;
    }
  }

  // ─── Clipboard: Copy Code ───────────────────────
  async copyCode(): Promise<void> {
    if (
      !this.referralCode ||
      this.referralCode === '...' ||
      this.referralCode === '---'
    )
      return;
    try {
      await navigator.clipboard.writeText(this.referralCode);
      this.codeCopied = true;
      this.showToast('Código copiado');
      setTimeout(() => (this.codeCopied = false), 2000);
    } catch {
      this.fallbackCopy(this.referralCode);
      this.codeCopied = true;
      this.showToast('Código copiado');
      setTimeout(() => (this.codeCopied = false), 2000);
    }
  }

  // ─── Clipboard: Copy Link ──────────────────────
  async copyLink(): Promise<void> {
    if (
      !this.referralLink ||
      this.referralLink === '...' ||
      this.referralLink === '---'
    )
      return;
    try {
      await navigator.clipboard.writeText(this.referralLink);
      this.linkCopied = true;
      this.showToast('Enlace copiado');
      setTimeout(() => (this.linkCopied = false), 2000);
    } catch {
      this.fallbackCopy(this.referralLink);
      this.linkCopied = true;
      this.showToast('Enlace copiado');
      setTimeout(() => (this.linkCopied = false), 2000);
    }
  }

  private fallbackCopy(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }

  // ─── Toast ─────────────────────────────────────
  private showToast(message: string): void {
    this.toastMessage = message;
    this.toastVisible = true;
    setTimeout(() => (this.toastVisible = false), 2000);
  }

  // ─── Social Sharing ────────────────────────────
  shareSocial(platform: string): void {
    const message = `¡Hola! Te invito a unirte a TradingView. Regístrate usando mi enlace único y mi código de invitación: ${this.referralCode}\n\nEnlace de registro:\n${this.referralLink}`;
    const encodedMessage = encodeURIComponent(message);
    const encodedUrl = encodeURIComponent(this.referralLink);

    let targetUrl = '';

    switch (platform) {
      case 'whatsapp':
        targetUrl = `https://wa.me/?text=${encodedMessage}`;
        break;
      case 'telegram':
        targetUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(`¡Únete a TradingView! Usa mi código de invitación: ${this.referralCode}`)}`;
        break;
      case 'facebook':
        targetUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
    }

    if (targetUrl) {
      const fallbackAnchor = document.createElement('a');
      fallbackAnchor.href = targetUrl;
      fallbackAnchor.target = '_blank';
      fallbackAnchor.rel = 'noopener noreferrer';
      document.body.appendChild(fallbackAnchor);
      fallbackAnchor.click();
      document.body.removeChild(fallbackAnchor);
    }
  }
}
