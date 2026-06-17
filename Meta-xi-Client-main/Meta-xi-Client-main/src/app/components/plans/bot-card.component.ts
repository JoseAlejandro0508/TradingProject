import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BotPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  dailyProfitEstimate: number;
  durationDays: number;
  tradingPair: string;
  winRate?: number;
  isFreeTier: boolean;
  freeTierMaxUses?: number;
  imageUrl?: string;
  exchanges?: string[];
  stockAvailable?: number;
  stockMax?: number;
}

@Component({
  selector: 'app-bot-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bot-card.component.html',
  styleUrls: ['./bot-card.component.scss']
})
export class BotCardComponent {
  @Input() botPlan!: BotPlan;
  @Input() userStock: number = 0;
  @Input() canDeploy: boolean = true;
  @Input() isFreeClaimed: boolean = false;

  @Output() onCalculate = new EventEmitter<BotPlan>();
  @Output() onDeploy = new EventEmitter<BotPlan>();

  get isDepleted(): boolean {
    if (this.botPlan.isFreeTier) {
      return this.isFreeClaimed;
    }
    return this.userStock <= 0;
  }

  get stockDisplay(): string {
    if (this.botPlan.isFreeTier) {
      return this.isFreeClaimed ? 'Reclamado' : '1/1';
    }
    return `${this.userStock}/${this.botPlan.stockMax || 1}`;
  }

  get formattedPrice(): string {
    if (this.botPlan.isFreeTier) {
      return 'GRATIS';
    }
    return `${this.botPlan.price.toLocaleString('es-CO')} COP`;
  }

  get dailyProfit(): string {
    return `+${this.botPlan.dailyProfitEstimate.toLocaleString('es-CO')} COP`;
  }

  get weeklyProfit(): string {
    const weekly = this.botPlan.dailyProfitEstimate * 7;
    return `+${weekly.toLocaleString('es-CO')} COP`;
  }

  get monthlyProfit(): string {
    const monthly = this.botPlan.dailyProfitEstimate * 30;
    return `+${monthly.toLocaleString('es-CO')} COP`;
  }

  get totalProfit(): string {
    const total = this.botPlan.dailyProfitEstimate * this.botPlan.durationDays;
    return `+${total.toLocaleString('es-CO')} COP`;
  }

  get winRateDisplay(): string {
    return this.botPlan.winRate ? `${this.botPlan.winRate}%` : '85%';
  }

  getExchangeColor(exchange: string): string {
    const colors: { [key: string]: string } = {
      'Binance': '#f0b90b',
      'Coinbase': '#0052ff',
      'Kraken': '#5d45dc',
      'Bybit': '#f7a600',
      'OKX': '#000000',
      'KuCoin': '#01bc8d',
      'Bitfinex': '#00ac57',
      'Huobi': '#2e7de4',
      'Gate.io': '#de5f5f',
      'MEXC': '#1a7dec'
    };
    return colors[exchange] || '#2962ff';
  }

  handleCalculate(): void {
    if (!this.isDepleted) {
      this.onCalculate.emit(this.botPlan);
    }
  }

  handleDeploy(): void {
    if (!this.isDepleted && this.canDeploy) {
      this.onDeploy.emit(this.botPlan);
    }
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/bots/default-bot.png';
  }
}
