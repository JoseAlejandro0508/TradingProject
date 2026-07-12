import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/products/notification.service';
import { ThemeService } from '../../services/theme.service';
import { TelegramService } from '../../services/products/Telegram.service';
import { environment } from '../../../environments/environment';

interface ChatMessage {
  type: 'user' | 'system';
  text: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, NgClass, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private themeService = inject(ThemeService);
  private telegramService = inject(TelegramService);

  // ─── Theme ───────────────────────────────────────────
  isDarkMode = this.themeService.getTheme() === 'dark';

  // ─── Sidebar ─────────────────────────────────────────
  sidebarOpen = false;

  // ─── Chat ────────────────────────────────────────────
  chatOpen = false;
  messages: ChatMessage[] = [];
  newMessage = '';

  // ─── User ────────────────────────────────────────────
  username: string = localStorage.getItem('username') || '';

  // ─── Modal ───────────────────────────────────────────
  showModal = false;
  isClaimed: boolean = false;

  // ─── Welcome Bonus ───────────────────────────────────
  Bonus: number = 2500;

  ngOnInit(): void {
    this.ngBonusClaimed();
  }

  // ─── Theme Toggle ────────────────────────────────────
  toggleTheme(): void {
    const next = this.themeService.toggleTheme();
    this.isDarkMode = next === 'dark';
  }

  get themeLabel(): string {
    return this.themeService.getTheme() === 'dark'
      ? 'Modo Claro'
      : 'Modo Oscuro';
  }

  // ─── Sidebar ─────────────────────────────────────────
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  // ─── Navigation ──────────────────────────────────────
  navigateTo(route: string, section?: string): void {
    this.sidebarOpen = false;
    if (route === '#') return;
    this.router.navigate([route], { state: { sectionOpen: section } });
  }

  // ─── Chat ────────────────────────────────────────────
  openChat(): void {
    this.chatOpen = true;
    this.LoadMessages();
  }

  closeChat(): void {
    this.chatOpen = false;
  }

  async LoadMessages(): Promise<void> {
    this.chatOpen = true;
    this.messages = [];
    const url = `${environment.apiUrl}/Chat/GetMessages/${this.username}`;
    try {
      const response: any = await firstValueFrom(this.http.get(url));
      response.forEach((element: ChatMessage) => {
        this.messages.push(element);
      });
    } catch (error: any) {
      console.error('Error al cargar mensajes', error);
    }
  }

  buildChatMessage(message: string): string {
    return `${this.username}\n\n${message}`;
  }

  async sendMessage(): Promise<void> {
    const text = this.newMessage.trim();
    if (!text) return;
    const url = `${environment.apiUrl}/Chat/AddMessage`;
    try {
      await firstValueFrom(
        this.http.post(url, {
          UserPhone: this.username,
          IsFromAdmin: false,
          Message: text,
        })
      );
    } catch (error: any) {
      console.error('Error al enviar mensaje', error);
    }

    this.messages.push({ type: 'user', text });
    await firstValueFrom(
      this.telegramService.sendMessage$(
        this.buildChatMessage(text),
        '5173389964:AAHuic8a_je7sn-iEj8bVBrKSKTH_ncJvG0',
        '-1004450660069'
      )
    );
    this.newMessage = '';
    setTimeout(() => {
      this.messages.push({
        type: 'system',
        text: 'Gracias por tu mensaje. Un asesor te responderá pronto.',
      });
    }, 1200);
  }

  // ─── Welcome Bonus ───────────────────────────────────
  async ngBonusClaimed() {
    const url = `${environment.apiUrl}/Wallet/ClaimWelcomeBonus/` + this.username;
    try {
      const response = await firstValueFrom(this.http.get(url));
      console.log(response);
      this.isClaimed = false;
    } catch (error) {
      console.error(error);
      this.isClaimed = true;
    }
  }

  async GetBonus() {
    const url = `${environment.apiUrl}/Wallet/ClaimWelcomeBonus`;
    const data = {
      email: this.username,
      token: 'nequi',
      balance: 2500,
    };

    try {
      await firstValueFrom(this.http.post(url, data));
      this.notificationService.correct('Bono reclamado exitosamente');
      this.isClaimed = true;
    } catch (error) {
      this.notificationService.errorMessage('Error al reclamar bono');
    }
    this.showModal = !this.showModal;
    window.location.reload();
  }

  toggleModal() {
    this.showModal = !this.showModal;
  }

  @HostListener('document:keydown.escape', [])
  onEscapePress() {
    if (this.chatOpen) {
      this.closeChat();
    } else if (this.sidebarOpen) {
      this.closeSidebar();
    }
  }
}
