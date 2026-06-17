import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ActiveBot {
  id: number;
  botPlanId: number;
  botPlanName: string;
  botPlanImageUrl?: string;
  startedAt: string;
  expiresAt: string;
  accumulatedProfit: number;
  status: 'Active' | 'Paused';
  tradingPair: string;
  dailyProfitEstimate: number;
  acquisitionCost?: number;
}

@Component({
  selector: 'app-active-bot-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './active-bot-card.component.html',
  styleUrls: ['./active-bot-card.component.scss']
})
export class ActiveBotCardComponent {
  @Input() activePlan!: ActiveBot;
  @Input() isPausing = false;
  @Input() isResuming = false;
  @Output() pause = new EventEmitter<void>();
  @Output() resume = new EventEmitter<void>();

  get daysRemaining(): number {
    const now = new Date();
    const expires = new Date(this.activePlan.expiresAt);
    const diffTime = expires.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  get totalDays(): number {
    const start = new Date(this.activePlan.startedAt);
    const expires = new Date(this.activePlan.expiresAt);
    const diffTime = expires.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get daysElapsed(): number {
    return this.totalDays - this.daysRemaining;
  }

  get timeProgressPercent(): number {
    if (this.totalDays === 0) return 0;
    return Math.round((this.daysElapsed / this.totalDays) * 100);
  }

  get expectedTotalProfit(): number {
    return this.activePlan.dailyProfitEstimate * this.totalDays;
  }

  get moneyProgressPercent(): number {
    if (this.expectedTotalProfit === 0) return 0;
    return Math.round((this.activePlan.accumulatedProfit / this.expectedTotalProfit) * 100);
  }

  get dailyProfit(): string {
    return `+${this.activePlan.dailyProfitEstimate.toLocaleString('es-CO')} COP`;
  }

  get weeklyProfit(): string {
    const weekly = this.activePlan.dailyProfitEstimate * 7;
    return `+${weekly.toLocaleString('es-CO')} COP`;
  }

  get monthlyProfit(): string {
    const monthly = this.activePlan.dailyProfitEstimate * 30;
    return `+${monthly.toLocaleString('es-CO')} COP`;
  }

  get formattedAccumulated(): string {
    return `${Number(this.activePlan.accumulatedProfit).toLocaleString('es-CO')} COP`;
  }

  get formattedExpected(): string {
    return `${this.expectedTotalProfit.toLocaleString('es-CO')} COP`;
  }

  get formattedAcquisitionCost(): string {
    const cost = this.activePlan.acquisitionCost || 0;
    return `${cost.toLocaleString('es-CO')} COP`;
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/bots/default-bot.png';
  }

  onPause(): void {
    if (!this.isPausing) {
      this.pause.emit();
    }
  }

  onResume(): void {
    if (!this.isResuming) {
      this.resume.emit();
    }
  }
}
