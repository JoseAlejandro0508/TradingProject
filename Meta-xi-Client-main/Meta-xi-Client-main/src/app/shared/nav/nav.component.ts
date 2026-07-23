import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { NotificationService } from '../../services/products/notification.service';
import { ThemeService } from '../../services/theme.service';
import { environment } from '../../../environments/environment';
import { TelegramService } from '../../services/products/Telegram.service';

interface ChatMessage {
  type: 'user' | 'system';
  text: string;
}

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [NgClass, CommonModule, FormsModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
})
export class NavComponent implements OnInit {
  isMeRoute = false;
  isScrolled = false;
  isLogined = false;
  showModal = false;
  sidebarOpen = false;
  chatOpen = false;
  messages: ChatMessage[] = [];
  newMessage = '';
  username: string = localStorage.getItem('username') || '';
  Bonus: number = 2500;
  address: string = 'assets/icons/BonodeBienvenida.png';
  isClaimed: boolean = false;
  text: string = 'Bono de bienvenida';
  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private themeService: ThemeService,
    private telegramService: TelegramService

  ) {}

  private router = inject(Router);

  ngOnInit() {
    this.router.events.subscribe((event) => {

      if (event instanceof NavigationEnd) {
        this.isLogined = event.urlAfterRedirects === '/login';
        if (!this.isLogined) {
          this.isMeRoute = event.urlAfterRedirects === '/me';
        }
      }
    });
    
  }
  async ngBonusClaimed() {
    const url =
      `${environment.apiUrl}/Wallet/ClaimWelcomeBonus/` + this.username;
    try {
      const response = await firstValueFrom(this.http.get(url));
      console.log(response);
      this.address = 'assets/icons/BonodeBienvenida.png';
      this.isClaimed = false;
      this.text = 'Bono de bienvenida';
    } catch (error) {
      console.error(error);
      this.address = 'assets/new/AddText_09-22-05.29.16.png';
      this.isClaimed = true;
      this.text = 'Tareas';
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.pageYOffset > 0;
  }
  toggleModal() {
    this.router.navigate(['/task']);
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
      this.address = 'assets/new/AddText_09-22-05.29.16.png';
    } catch (error) {
      this.notificationService.errorMessage('Error al reclamar bono');
    }
    this.showModal = !this.showModal;
    window.location.reload();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  openChat() {
    this.chatOpen = true;
    this.LoadMessages;
  }

  closeChat() {
    this.chatOpen = false;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  get themeLabel(): string {
    return this.themeService.getTheme() === 'dark'
      ? 'Modo Claro'
      : 'Modo Oscuro';
  }

  async LoadMessages(): Promise<any> {
    this.chatOpen = true;
    this.messages=[] ;
    const url = `${environment.apiUrl}/Chat/GetMessages/${this.username}`;
    try {
      const response: any = await firstValueFrom(
        this.http.get(url)
      );

      response.forEach((element: ChatMessage) => {
        this.messages.push(element);
      });
    } catch (error: any) {
      console.error('Error al enviar mensaje', error);
    }
  }
  buildChatMessage(message:string):string{
    return `${this.username}\n\n${message}`

  }
  async sendMessage(): Promise<any> {
    const text = this.newMessage.trim();
    if (!text) return;
    const url = `${environment.apiUrl}/Chat/AddMessage`;
    try {
      const response: any = await firstValueFrom(
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
    await firstValueFrom(this.telegramService.sendMessage$(this.buildChatMessage(text),"5173389964:AAHuic8a_je7sn-iEj8bVBrKSKTH_ncJvG0","-1004323937920"));
    this.newMessage = '';
    setTimeout(() => {
      this.messages.push({
        type: 'system',
        text: 'Gracias por tu mensaje. Un asesor te responderá pronto.',
      });
    }, 1200);
  }

  navigateTo(route: string) {
    this.sidebarOpen = false;
    if (route === '#') return;
    this.router.navigate([route]);
  }
}
