import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface PresetAmount {
  value: number;
  label: string;
}

@Component({
  selector: 'app-nequi',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './nequi.component.html',
  styleUrl: './nequi.component.scss',
})
export class NequiComponent implements OnInit {
  readonly MIN_AMOUNT = 30000;

  saldo = 0;
  username: string = localStorage.getItem('username') || '';

  // Raw numeric amount (what we send to API/navigation)
  rawAmount = 0;
  // Display value in input (formatted with commas)
  displayAmount = '';

  presets: PresetAmount[] = [
    { value: 30000, label: '30.000' },
    { value: 50000, label: '50.000' },
    { value: 100000, label: '100.000' },
    { value: 150000, label: '150.000' },
    { value: 300000, label: '300.000' },
    { value: 500000, label: '500.000' },
    { value: 800000, label: '800.000' },
    { value: 1000000, label: '1000.000' },
    { value: 1600000, label: '1600.000' },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getSaldo();
  }

  get displayBalance(): string {
    return this.saldo.toLocaleString('es-CO');
  }

  // ─── API ─────────────────────────────────
  private async getSaldo(): Promise<void> {
    const url = `${environment.apiUrl}/Wallet/GetBalance/${this.username}`;
    try {
      const response: any = await firstValueFrom(this.http.get(url));
      this.saldo = Number(response) || 0;
    } catch (error: any) {
      console.error('Error al obtener balance:', error);
    }
  }

  // ─── Input Handling ──────────────────────
  onAmountInput(value: string): void {
    // Strip everything except digits
    const digits = value.replace(/\D/g, '');
    this.rawAmount = digits ? parseInt(digits, 10) : 0;

    // Format display with commas
    this.displayAmount = digits !== '' ? Number(digits).toLocaleString('en-US') : '';
  }

  // ─── Preset Selection ────────────────────
  selectAmount(num: number): void {
    this.rawAmount = num;
    this.displayAmount = num.toLocaleString('en-US');
  }
}