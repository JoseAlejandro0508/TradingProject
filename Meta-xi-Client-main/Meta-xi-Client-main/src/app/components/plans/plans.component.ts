import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NotificationService } from '../../services/products/notification.service';
import { ThemeService } from '../../services/theme.service';
import { 
  BotPlanService, 
  BotPlanDTO, 
  UserActivePlanDTO, 
  UserFreeUsageDTO 
} from '../../services/bot-plan.service';
import { environment } from '../../../environments/environment';

// Extended interface with UI-specific properties
interface BotPlanWithStock extends BotPlanDTO {
  stockAvailable?: number;
}

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.scss'],
})
export class PlansComponent implements OnInit {
  // Services
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);
  private botPlanService = inject(BotPlanService);
  themeService = inject(ThemeService);

  // User data
  username = localStorage.getItem('username') || '';
  userBalance = 0;
  totalEarnings = 0; // Will be calculated from active plans
  // totalInvestment is a getter, defined below

  // Tab state
  activeTab: 'tradingbots' | 'mis-sistemas' = 'tradingbots';

  // Data
  botPlans: BotPlanWithStock[] = [];
  activePlans: UserActivePlanDTO[] = [];
  freeUsages: UserFreeUsageDTO[] = [];

  // Loading states
  isLoadingBots = false;
  isLoadingActive = false;
  isDeploying = false;
  isPausingBot: { [key: number]: boolean } = {};
  isResumingBot: { [key: number]: boolean } = {};

  // Modal states
  showCalculatorModal = false;
  showDeployModal = false;
  selectedBotForCalculator: BotPlanWithStock | null = null;
  selectedBotForDeploy: BotPlanWithStock | null = null;

  // UI States
  infoDropdownOpen = false;
  showToast = false;
  toastMessage = '';

  @ViewChild('toastNotification') toastNotification!: ElementRef;

  // API base URL
  apiBaseUrl = environment.apiUrl.replace('/api', '');

  async ngOnInit(): Promise<void> {
    console.log('PlansComponent initialized, loading data...');
    await this.loadUserBalance();
    console.log('User balance loaded:', this.userBalance);
    await this.loadAvailableBots();
    console.log('Bot plans loaded:', this.botPlans.length, 'bots');
    await this.loadFreeUsage();
    await this.loadActiveBots();
    this.updateTotalEarnings();
    console.log('All data loaded. Total earnings:', this.totalEarnings, 'Active plans:', this.activePlans.length);
  }

  // --- Theme ---
  get isDarkMode(): boolean {
    return this.themeService.getTheme() === 'dark';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  // --- Tab Navigation ---
  setTab(tab: 'tradingbots' | 'mis-sistemas'): void {
    this.activeTab = tab;
    if (tab === 'mis-sistemas') {
      this.loadActiveBots();
    }
  }

  // --- Data Loading ---
  async loadUserBalance(): Promise<void> {
    try {
      const url = `${environment.apiUrl}/Wallet/GetBalance/${this.username}`;
      const response = await firstValueFrom(
        this.http.get(url)
      );
      this.userBalance = parseFloat(response.toString()) || 0;
    } catch (error) {
      console.error('Error loading balance:', error);
      this.userBalance = 0;
    }
  }

  async loadAvailableBots(): Promise<void> {
    this.isLoadingBots = true;
    try {
      const bots = await this.botPlanService.getAvailableBots();
      
      // Map to extended interface with stock info
      this.botPlans = bots.map(bot => ({
        ...bot,
        stockAvailable: bot.stockMax // Initialize with max stock
      }));

      // Calculate actual stock availability
      await this.calculateStockAvailability();
    } catch (error: any) {
      console.error('Error loading bots:', error);
      this.notificationService.errorMessage('Error al cargar los bots disponibles');
    } finally {
      this.isLoadingBots = false;
    }
  }

  async loadActiveBots(): Promise<void> {
    if (!this.username) return;

    this.isLoadingActive = true;
    try {
      this.activePlans = await this.botPlanService.getMyActiveBots(this.username);
      this.updateTotalEarnings();
    } catch (error: any) {
      console.error('Error loading active bots:', error);
      this.notificationService.errorMessage('Error al cargar tus sistemas activos');
    } finally {
      this.isLoadingActive = false;
    }
  }

  async loadFreeUsage(): Promise<void> {
    if (!this.username) return;

    try {
      this.freeUsages = await this.botPlanService.getFreeUsage(this.username);
    } catch (error) {
      console.error('Error loading free usage:', error);
      this.freeUsages = [];
    }
  }

  async calculateStockAvailability(): Promise<void> {
    if (!this.username) return;

    try {
      // Get user's active bots to calculate remaining stock
      const activeBots = await this.botPlanService.getMyActiveBots(this.username);
      console.log('Active bots from API:', activeBots); // DEBUG

      // Count active bots per plan
      const activeCountByPlan: { [key: number]: number } = {};
      activeBots.forEach(bot => {
        activeCountByPlan[bot.botPlanId] = (activeCountByPlan[bot.botPlanId] || 0) + 1;
      });
      console.log('Active count by plan:', activeCountByPlan); // DEBUG

      // Update stock available for each bot
      this.botPlans = this.botPlans.map(bot => {
        // Default stockMax to 1 if not provided from backend
        const maxStock = bot.stockMax || 1;
        const activeCount = activeCountByPlan[bot.id] || 0;
        const availableStock = Math.max(0, maxStock - activeCount);
        
        console.log(`Bot ${bot.name} (ID: ${bot.id}): maxStock=${maxStock}, active=${activeCount}, available=${availableStock}`); // DEBUG
        
        return {
          ...bot,
          stockMax: maxStock,
          stockAvailable: availableStock
        };
      });
    } catch (error) {
      console.error('Error calculating stock:', error);
      // Default to showing stock from backend (stockMax) if there's an error
      this.botPlans = this.botPlans.map(bot => ({
        ...bot,
        stockMax: bot.stockMax || 1,
        stockAvailable: bot.stockMax || 1
      }));
    }
  }

  // --- Computed Properties ---
  get visibleBotPlans(): BotPlanWithStock[] {
    // Filter out free bots that have been claimed
    return this.botPlans.filter(bot => {
      if (bot.isFreeTier && this.isFreeBotClaimed(bot.id)) {
        return false;
      }
      return true;
    });
  }

  get totalInvestment(): number {
    return this.activePlans.reduce((acc, plan) => acc + (plan.acquisitionCost || 0), 0);
  }

  updateTotalEarnings(): void {
    // Calculate total earnings from active plans (REAL data, no hardcoded base)
    this.totalEarnings = this.activePlans.reduce((acc, plan) => acc + (plan.accumulatedProfit || 0), 0);
  }

  // --- User Stock Helpers ---
  getStockAvailable(bot: BotPlanWithStock): number {
    return bot.stockAvailable || 0;
  }

  isFreeBotClaimed(botId: number): boolean {
    const usage = this.freeUsages.find(u => u.botPlanId === botId);
    return usage ? !usage.isEligible : false;
  }

  canUserDeployBot(bot: BotPlanWithStock): boolean {
    if (this.getStockAvailable(bot) === 0) return false;
    if (bot.isFreeTier) {
      return !this.isFreeBotClaimed(bot.id);
    }
    return this.userBalance >= bot.price;
  }

  // --- Event Handlers ---
  toggleInfoDropdown(): void {
    this.infoDropdownOpen = !this.infoDropdownOpen;
  }

  openCalculator(bot: BotPlanWithStock): void {
    this.selectedBotForCalculator = bot;
    this.showCalculatorModal = true;
  }

  closeCalculator(): void {
    this.showCalculatorModal = false;
    this.selectedBotForCalculator = null;
  }

  closeCalculatorOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeCalculator();
    }
  }

  onDeploy(bot: BotPlanWithStock): void {
    if (!this.canUserDeployBot(bot)) {
      if (this.getStockAvailable(bot) === 0) {
        this.showToastNotification('Este bot está agotado');
      } else if (!bot.isFreeTier && this.userBalance < bot.price) {
        this.showToastNotification('Saldo insuficiente');
      }
      return;
    }
    this.selectedBotForDeploy = bot;
    this.showDeployModal = true;
  }

  closeDeploy(): void {
    this.showDeployModal = false;
    this.selectedBotForDeploy = null;
  }

  closeDeployOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeDeploy();
    }
  }

  async confirmDeploy(): Promise<void> {
    if (!this.selectedBotForDeploy || !this.username) return;

    this.isDeploying = true;
    try {
      const response = await this.botPlanService.deployBot({
        username: this.username,
        botPlanId: this.selectedBotForDeploy.id
      });

      this.showToastNotification(`${this.selectedBotForDeploy.name} activado correctamente`);
      
      // Close modal
      this.closeDeploy();
      
      // Refresh data
      await this.loadUserBalance();
      await this.loadFreeUsage();
      await this.calculateStockAvailability();
      await this.loadActiveBots();
      
      // Switch to active systems tab
      this.setTab('mis-sistemas');
    } catch (error: any) {
      console.error('Error deploying bot:', error);
      this.notificationService.errorMessage(error.message || 'Error al desplegar el bot');
    } finally {
      this.isDeploying = false;
    }
  }

  // --- Active Plan Helpers ---
  getDaysRemaining(plan: UserActivePlanDTO): number {
    const expiresAt = new Date(plan.expiresAt);
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  getProgressPercentage(plan: UserActivePlanDTO): number {
    const startedAt = new Date(plan.startedAt);
    const expiresAt = new Date(plan.expiresAt);
    const now = new Date();
    
    const totalDuration = expiresAt.getTime() - startedAt.getTime();
    const elapsed = now.getTime() - startedAt.getTime();
    
    if (totalDuration <= 0) return 100;
    const percentage = (elapsed / totalDuration) * 100;
    return Math.min(100, Math.max(0, percentage));
  }

  getTotalProfitForPlan(plan: UserActivePlanDTO): number {
    // Calculate total expected profit based on daily estimate and duration
    // This is an approximation
    const bot = this.botPlans.find(b => b.id === plan.botPlanId);
    if (bot) {
      return bot.totalProfitEstimate;
    }
    // Fallback calculation
    return plan.dailyProfitEstimate * 30; // Assume 30 days if no bot data
  }

  getProfitProgressPercentage(plan: UserActivePlanDTO): number {
    const totalExpected = this.getTotalProfitForPlan(plan);
    if (totalExpected <= 0) return 0;
    const percentage = ((plan.accumulatedProfit || 0) / totalExpected) * 100;
    return Math.min(100, Math.max(0, percentage));
  }

  // --- Toast ---
  showToastNotification(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  // --- Pause/Resume Bot ---
  async pauseBot(plan: UserActivePlanDTO): Promise<void> {
    if (this.isPausingBot[plan.id]) return;

    this.isPausingBot[plan.id] = true;
    try {
      const response = await this.botPlanService.pauseBot(plan.id);
      this.showToastNotification(response.message);
      
      // Update local state
      const planIndex = this.activePlans.findIndex(p => p.id === plan.id);
      if (planIndex !== -1) {
        this.activePlans[planIndex].status = 'Paused';
      }
    } catch (error: any) {
      console.error('Error pausing bot:', error);
      this.notificationService.errorMessage(error.message || 'Error al pausar el bot');
    } finally {
      this.isPausingBot[plan.id] = false;
    }
  }

  async resumeBot(plan: UserActivePlanDTO): Promise<void> {
    if (this.isResumingBot[plan.id]) return;

    this.isResumingBot[plan.id] = true;
    try {
      const response = await this.botPlanService.resumeBot(plan.id);
      this.showToastNotification(response.message);
      
      // Update local state
      const planIndex = this.activePlans.findIndex(p => p.id === plan.id);
      if (planIndex !== -1) {
        this.activePlans[planIndex].status = 'Active';
      }
    } catch (error: any) {
      console.error('Error resuming bot:', error);
      this.notificationService.errorMessage(error.message || 'Error al reanudar el bot');
    } finally {
      this.isResumingBot[plan.id] = false;
    }
  }
}
