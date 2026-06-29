import { Component, OnInit, OnDestroy, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { NotificationService } from '../../services/products/notification.service';
import { ThemeService } from '../../services/theme.service';
import {
  BotPlanService,
  BotPlanDTO,
  UserActivePlanDTO,
  UserFreeUsageDTO
} from '../../services/bot-plan.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private themeService = inject(ThemeService);
  private botPlanService = inject(BotPlanService);

  // ─── User Data ───────────────────────────────────────
  username: string = localStorage.getItem('username') || '';
  balanceCOP: number = 0;
  balanceUSD: string = '0.00';
  EarnPerSecond:number=0;
  // ─── Theme ───────────────────────────────────────────
  isDarkMode = this.themeService.getTheme() === 'dark';

  // ─── Carousel ────────────────────────────────────────
  currentSlide = 0;
  totalSlides = 6;
  carouselInterval: any;

  // ─── Bot State ───────────────────────────────────────
  isBotRunning = false;
  isLoadingBot = false;
  liveEarnings: number = 0;
  hourlyEarnings: number = 0;
  dailyEarnings: number = 0;
  
  // ─── Bot Data ──────────────────────────────────────
  freeBot: BotPlanDTO | null = null;
  activePlans: UserActivePlanDTO[] = [];
  freeUsages: UserFreeUsageDTO[] = [];
  activeFreePlan: UserActivePlanDTO | null = null;

  // ─── Toast ───────────────────────────────────────────
  showToast = false;
  toastMessage = '';
  toastTimeout: any;

  // ─── Earnings Simulation ─────────────────────────────
  private earningsInterval: any;
  private earningsBalanceInterval:any;

  async ngOnInit(): Promise<void> {
    this.startCarousel();
    await this.loadUserData();
    await this.loadBotData();
    this.checkActiveFreeBot();
  }

  ngOnDestroy(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
    if (this.earningsInterval) {
      clearInterval(this.earningsInterval);
    }
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  // ─── Theme ───────────────────────────────────────────
  toggleTheme(): void {
    const next = this.themeService.toggleTheme();
    this.isDarkMode = next === 'dark';
  }

  // ─── Data Loading ────────────────────────────────────
  private async loadUserData(): Promise<void> {
    await this.getMyBalance();
  }

  private async loadBotData(): Promise<void> {
    try {
      // Load available bots
      const bots = await this.botPlanService.getAvailableBots();
      this.freeBot = bots.find(b => b.isFreeTier) || null;
      
      // Load active plans
      this.activePlans = await this.botPlanService.getMyActiveBots(this.username);
      
      // Load free usage
      this.freeUsages = await this.botPlanService.getFreeUsage(this.username);
      
      this.checkActiveFreeBot();
    } catch (error) {
      console.error('Error loading bot data:', error);
    }
  }

  private checkActiveFreeBot(): void {
    // Find active free bot plan
    this.activeFreePlan = this.activePlans.find(
      plan => plan.status === 'Active' && this.isFreePlan(plan.botPlanId)
    ) || null;

    if (this.activeFreePlan) {
      this.isBotRunning = true;
      const LastClaim=this.activeFreePlan.lastTradeAt;
      const Today=new Date().getTime();
      const LastTrade=new Date(this.activeFreePlan.lastTradeAt).getTime();
      const NotClaimedSeconds=(Today-LastTrade)/1000;
      const incrementPerSecond =this.activeFreePlan.dailyProfitEstimate/(3600*24) ;

      this.liveEarnings =NotClaimedSeconds*incrementPerSecond;
      
      // Calculate hourly and daily based on the bot plan
      const bot = this.freeBot;
      if (bot) {
        this.hourlyEarnings = parseFloat((bot.dailyProfitEstimate / 24).toFixed(2));
        this.dailyEarnings = parseFloat(bot.dailyProfitEstimate.toFixed(2));
      } else {
        this.hourlyEarnings = parseFloat((this.activeFreePlan.dailyProfitEstimate / 24).toFixed(2));
        this.dailyEarnings = parseFloat(this.activeFreePlan.dailyProfitEstimate.toFixed(2));
      }
      
      this.startEarningsSimulation();
    } else {
      this.isBotRunning = false;
      this.liveEarnings = 0;
      this.hourlyEarnings = 0;
      this.dailyEarnings = 0;
    }
  }

  private isFreePlan(botPlanId: number): boolean {
    if (this.freeBot && this.freeBot.id === botPlanId) return true;
    const usage = this.freeUsages.find(u => u.botPlanId === botPlanId);
    return usage !== undefined;
  }

  async ClaimFreeEarns(): Promise<void> {
    const url = `${environment.apiUrl}/BotPlans/ClaimFreeBotEarn`;
    try {

      const Body = {
          Username: this.username,
      };

      const res = await firstValueFrom(this.http.post(url, Body));

      await this.loadBotData();
      await this.getMyBalance();
    } catch(error: any) {
        this.notification.errorMessage(error.message || 'Error al reclamar ganancias');
    }
  }
  // ─── API: Get Balance ───────────────────────────────
  async getMyBalance(): Promise<void> {
    const url = `${environment.apiUrl}/Wallet/GetBalanceUsdAndCop/${this.username}`;
    try {
      const response: any = await firstValueFrom(this.http.get(url));
      this.balanceCOP = response.balanceInCop || 0;
      this.balanceUSD = response.balanceInUsd || '0.00';
      this.EarnPerSecond = response.earnPerSecond || 0;

      this.startEarningsBalanceSimulation();

    } catch {
      this.balanceUSD = 'N/A';
      this.balanceCOP = 0;
    }
  }

  // ─── Bot Action ──────────────────────────────────────
  async processBotAction(): Promise<void> {
    if (!this.isBotRunning) {
      // Activate free bot
      if (!this.freeBot) {
        this.showToastNotification('No hay bot gratuito disponible');
        return;
      }

      // Check if already claimed
      const usage = this.freeUsages.find(u => u.botPlanId === this.freeBot!.id);
      if (usage && !usage.isEligible) {
        this.showToastNotification('Ya has usado tu bot gratuito');
        return;
      }

      this.isLoadingBot = true;
      try {
        const response = await this.botPlanService.deployBot({
          username: this.username,
          botPlanId: this.freeBot.id
        });

        this.showToastNotification('¡TradingBot Activado con Éxito!');
        
        // Reload data
        await this.loadBotData();
        await this.getMyBalance();
        
        // Start earnings simulation
        this.startEarningsSimulation();
      } catch (error: any) {
        console.error('Error deploying bot:', error);
        this.notification.errorMessage(error.message || 'Error al activar el bot');
      } finally {
        this.isLoadingBot = false;
      }
    } else {
      // Collect earnings - navigate to plans or collect
      if (this.activeFreePlan) {

        await this.ClaimFreeEarns();
      }
    }
  }

  // ─── Earnings Simulation ───────────────────────────
  private startEarningsSimulation(): void {
    if (this.earningsInterval) {
      clearInterval(this.earningsInterval);
    }
    
    // Simulate small increments every second based on hourly rate
    const incrementPerSecond = this.hourlyEarnings / 3600;
    
    this.earningsInterval = setInterval(() => {
      if (this.isBotRunning && this.activeFreePlan) {
        this.liveEarnings += incrementPerSecond;
      }
    }, 1000);
  }
  private startEarningsBalanceSimulation(): void {
    if (this.earningsBalanceInterval) {
      clearInterval(this.earningsInterval);
    }
    
    
    this.earningsBalanceInterval = setInterval(() => {

      this.balanceCOP += this.EarnPerSecond;
     
    }, 1000);
  }


  // ─── Toast ───────────────────────────────────────────
  showToastNotification(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    
    this.toastTimeout = setTimeout(() => {
      this.showToast = false;
    }, 2500);
  }

  // ─── Carousel ──────────────────────────────────────
  private startCarousel(): void {
    this.carouselInterval = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
      this.scrollToSlide(this.currentSlide);
    }, 5000);

    // Add scroll listener for manual sync
    const carousel = document.getElementById('promoCarousel');
    if (carousel) {
      carousel.addEventListener('scroll', () => {
        const index = Math.round(carousel.scrollLeft / window.innerWidth);
        if (index !== this.currentSlide && index < this.totalSlides) {
          this.currentSlide = index;
          const root = document.documentElement;
          root.style.setProperty('--current-glow', `var(--nav-glow-${index + 1})`);
        }
      });
    }
  }

  scrollToSlide(index: number): void {
    this.currentSlide = index;
    const carousel = document.getElementById('promoCarousel');
    if (carousel) {
      carousel.scrollTo({ left: index * window.innerWidth, behavior: 'smooth' });
    }
    
    // Update glow color
    const root = document.documentElement;
    root.style.setProperty('--current-glow', `var(--nav-glow-${index + 1})`);
  }

  // ─── Navigation ──────────────────────────────────────
  navigateToRecharge(): void {
    this.router.navigate(['/recharge']);
  }

  navigateToWithdraw(): void {
    this.router.navigate(['/withdrawToken']);
  }

  navigateToTeam(): void {
    this.router.navigate(['/team']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  navigateToPlans(): void {
    this.router.navigate(['/plans']);
  }

  navigateToDailyClaim(): void {
    this.router.navigate(['/daily-claim']);
  }

  // ─── Formatters ──────────────────────────────────────
  formatBalance(value: number): string {
    return value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatEarnings(value: number): string {
    return value.toFixed(3);
  }
}
