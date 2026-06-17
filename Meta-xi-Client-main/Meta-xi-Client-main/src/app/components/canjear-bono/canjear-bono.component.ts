import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-canjear-bono',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './canjear-bono.component.html',
  styleUrl: './canjear-bono.component.scss',
})
export class CanjearBonoComponent implements OnInit {
  private router = inject(Router);
  themeService = inject(ThemeService);

  codeInput = '';
  isShaking = false;
  isOpen = false;
  rewardAmount: number | null = null;

  history: Array<{
    code: string;
    date: string;
    amount: number | null;
    status: string;
    statusClass: string;
  }> = [];

  private readonly codes: Record<string, number> = {
    '220822': 1800,
    '101010': 500,
    '777777': 5000,
  };

  private usedCodes = new Set<string>();

  ngOnInit(): void {
    // sync theme
    const current = this.themeService.getTheme();
    document.body.setAttribute('data-theme', current);
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  canjearCodigo(): void {
    const code = this.codeInput.trim();

    // Reset open state
    this.isOpen = false;
    this.rewardAmount = null;

    // Validate: numeric only, 6 digits
    if (!/^\d{6}$/.test(code)) {
      this.triggerShake();
      this.addToHistory(code || '-', null, 'Inválido', 'status-fail');
      return;
    }

    if (this.usedCodes.has(code)) {
      this.triggerShake();
      this.addToHistory(code, null, 'Ya Usado', 'status-fail');
      return;
    }

    const reward = this.codes[code];
    if (reward !== undefined) {
      this.usedCodes.add(code);
      this.rewardAmount = reward;
      this.isOpen = true;
      this.addToHistory(code, reward, 'Completado', 'status-success');
    } else {
      this.triggerShake();
      this.addToHistory(code, null, 'Inválido', 'status-fail');
    }
  }

  private triggerShake(): void {
    this.isShaking = true;
    setTimeout(() => {
      this.isShaking = false;
    }, 500);
  }

  private addToHistory(
    code: string,
    amount: number | null,
    status: string,
    statusClass: string
  ): void {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const dateStr = `${day}/${month}/${year}, ${hours}:${minutes}`;

    this.history.unshift({ code, date: dateStr, amount, status, statusClass });
  }
}
