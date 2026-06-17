import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { BotPlan } from './bot-card.component';

@Component({
  selector: 'app-deploy-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deploy-modal.component.html',
  styleUrls: ['./deploy-modal.component.scss']
})
export class DeployModalComponent {
  @Input() botPlan: BotPlan | null = null;
  @Input() isOpen: boolean = false;
  @Input() userBalance: number = 0;
  @Input() isLoading: boolean = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  get hasEnoughBalance(): boolean {
    if (!this.botPlan) return false;
    if (this.botPlan.isFreeTier) return true;
    return this.userBalance >= this.botPlan.price;
  }

  get balanceAfter(): number {
    if (!this.botPlan) return this.userBalance;
    if (this.botPlan.isFreeTier) return this.userBalance;
    return this.userBalance - this.botPlan.price;
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('es-CO');
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.isLoading) {
      this.close.emit();
    }
  }

  onClose(): void {
    if (!this.isLoading) {
      this.close.emit();
    }
  }

  onConfirm(): void {
    if (!this.isLoading && this.hasEnoughBalance) {
      this.confirm.emit();
    }
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/bots/default-bot.png';
  }
}
