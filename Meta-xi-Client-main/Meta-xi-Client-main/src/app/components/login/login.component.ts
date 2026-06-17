import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle.component';
import { TradingChartComponent } from './trading-chart/trading-chart.component';
import { PartnersCarouselComponent } from './partners-carousel/partners-carousel.component';
import { AuthModalComponent } from './auth-modal/auth-modal.component';

export interface TeamMember {
  role: string;
  name: string;
  country: string;
  age: string;
  profession: string;
}

export interface TeamData {
  title: string;
  items: { label: string; value: string }[];
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ThemeToggleComponent,
    TradingChartComponent,
    PartnersCarouselComponent,
    AuthModalComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
  authMode: 'reg' | 'log' = 'reg';
  authOpen = false;
  dropdownOpen = false;
  liveCounter = 689;
  private counterInterval: any;

  members: TeamMember[] = [
    { role: 'Director Ejecutivo (CEO)', name: 'Alexander Vance', country: 'Colombia', age: '34 años', profession: 'Ingeniero Financiero & Emprendedor' },
    { role: 'Principal Inversor', name: 'Mateo Sterling', country: 'Suiza', age: '42 años', profession: 'Gestor de Fondos de Cobertura' },
    { role: 'Equipo de Programación', name: 'DevCore Solutions', country: 'Global / Remoto', age: 'Corp.', profession: 'Ingenieros de Software Full-Stack' },
    { role: 'Editor de Contenido', name: 'Lucas Silva', country: 'Argentina', age: '28 años', profession: 'Diseñador Multimedia & Editor' },
    { role: 'Agente de Marketing', name: 'Elena Rostova', country: 'España', age: '31 años', profession: 'Estratega de Crecimiento Digital' },
  ];

  teamData: TeamData = {
    title: 'Datos de TradingView',
    items: [
      { label: 'Cantidad de Usuarios', value: '1.5M+ Activos' },
      { label: 'Cantidad de Inversores', value: '24 Firmas Globales' },
      { label: 'Volumen Diario', value: 'Alto Flujo de Capital' },
      { label: 'Nodos de Red', value: '12 Servidores Perimetrales' },
      { label: 'Estado del Sistema', value: 'Operando 24/7' },
    ],
  };

  ngOnInit(): void {
    this.counterInterval = setInterval(() => {
      this.liveCounter++;
    }, 2000);
  }

  ngOnDestroy(): void {
    if (this.counterInterval) {
      clearInterval(this.counterInterval);
      this.counterInterval = null;
    }
  }

  openAuthModal(mode: 'reg' | 'log'): void {
    this.authMode = mode;
    this.authOpen = true;
    this.dropdownOpen = false;
  }

  closeAuthModal(): void {
    this.authOpen = false;
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }
}
