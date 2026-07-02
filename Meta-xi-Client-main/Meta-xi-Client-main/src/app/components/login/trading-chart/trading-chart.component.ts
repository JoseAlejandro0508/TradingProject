import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CandleData {
  type: 'up' | 'down';
  height: string;
  delay: string;
}

@Component({
  selector: 'app-trading-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trading-chart.component.html',
  styleUrl: './trading-chart.component.scss',
})
export class TradingChartComponent {
  candles: CandleData[] = [
    { type: 'up', height: '40%', delay: '0.1s' },
    { type: 'down', height: '70%', delay: '0.4s' },
    { type: 'up', height: '55%', delay: '0.2s' },
    { type: 'up', height: '85%', delay: '0.7s' },
    { type: 'down', height: '35%', delay: '0.3s' },
    { type: 'up', height: '60%', delay: '0.9s' },
    { type: 'down', height: '50%', delay: '0.5s' },
    { type: 'up', height: '75%', delay: '1.1s' },
    { type: 'down', height: '50%', delay: '0.5s' },
    { type: 'up', height: '75%', delay: '1.1s' },
  ];
}
