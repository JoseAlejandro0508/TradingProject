import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
interface BonusHistory {
  reward:number,
  bonusID:string,
  date:string,
  state:string,
  error:boolean

}
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
  username: string = localStorage.getItem('username') || '';
  codeInput = '';
  isShaking = false;
  isOpen = false;
  rewardAmount: number | null = null;

  history:  BonusHistory[]  = [];

  private readonly codes: Record<string, number> = {
    '220822': 1800,
    '101010': 500,
    '777777': 5000,
  };

  private usedCodes = new Set<string>();
  constructor(private http: HttpClient) {}
  ngOnInit(): void {
    // sync theme
    const current = this.themeService.getTheme();
    document.body.setAttribute('data-theme', current);
    this.LoadHistory();
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  async canjearCodigo(): Promise<void> {
    const code = this.codeInput.trim();

    // Reset open state
    this.isOpen = false;
    this.rewardAmount = null;

    const url = `${environment.apiUrl}/Bonus/ClaimBonus`;
    try {
      const response: any = await firstValueFrom(
        this.http.post(url, { PhoneNumber: this.username, BonusID: code })
      );
    } catch (error: any) {
   
      console.error('Error al canjear código:', error);
    }

    this.triggerShake();
    await this.LoadHistory();

  }
  async LoadHistory(): Promise<void> {
    const code = this.codeInput.trim();
    this.history=[];
    // Reset open state
    this.isOpen = false;
    this.rewardAmount = null;

    const url = `${environment.apiUrl}/Bonus/BonusHistorial/${this.username}`;
    try {
      const response: any = await firstValueFrom(
        this.http.get(url)
      );
      response.forEach((element: BonusHistory) => {
        this.history.push(element);
      });
    } catch (error: any) {
      console.error('Error al canjear código:', error);
    }
    
  }

  private triggerShake(): void {
    this.isShaking = true;
    setTimeout(() => {
      this.isShaking = false;
    }, 500);
  }

}
