import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { BotPlan } from './bot-card.component';

@Component({
  selector: 'app-calculator-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calculator-modal.component.html',
  styleUrls: ['./calculator-modal.component.scss']
})
export class CalculatorModalComponent {
  @Input() botPlan: BotPlan | null = null;
  @Input() isOpen: boolean = false;

  @Output() close = new EventEmitter<void>();

  get dailyProfit(): number {
    return this.botPlan?.dailyProfitEstimate || 0;
  }

  get weeklyProfit(): number {
    return this.dailyProfit * 7;
  }

  get monthlyProfit(): number {
    return this.dailyProfit * 30;
  }

  get totalProfit(): number {
    if (!this.botPlan) return 0;
    return this.dailyProfit * this.botPlan.durationDays;
  }

  get cost(): number {
    return this.botPlan?.price || 0;
  }

  get duration(): number {
    return this.botPlan?.durationDays || 0;
  }

  get roi(): number {
    if (this.cost === 0) return 100; // Free bot shows 100% ROI
    return Math.round((this.totalProfit / this.cost) * 100);
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('es-CO');
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
