import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Partner {
  name: string;
  className: string;
}

@Component({
  selector: 'app-partners-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './partners-carousel.component.html',
  styleUrl: './partners-carousel.component.scss',
})
export class PartnersCarouselComponent {
  partners: Partner[] = [
    { name: 'Binance', className: 'p-binance' },
    { name: 'Kucoin', className: 'p-kucoin' },
    { name: 'Crypto.com', className: 'p-crypto' },
    { name: 'Bybit', className: 'p-bybit' },
    { name: 'UFC', className: 'p-ufc' },
    { name: 'Bet365', className: 'p-bet365' },
    { name: 'OKX', className: 'p-okx' },
    { name: 'TradingView', className: 'p-tradingview' },
  ];

  get trackItems(): Partner[] {
    return [...this.partners, ...this.partners];
  }
}
