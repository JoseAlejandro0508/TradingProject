import { Component, OnInit, OnDestroy, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DailyClaimService, DailyClaimStatus } from '../../services/daily-claim.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-daily-claim',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './daily-claim.component.html',
  styleUrl: './daily-claim.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DailyClaimComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private dailyClaimService = inject(DailyClaimService);
  private themeService = inject(ThemeService);

  username = localStorage.getItem('username') || '';
  isDarkMode = this.themeService.getTheme() === 'dark';

  // Data from API
  claimedToday = false;
  streak = 0;
  totalDays = 0;
  totalEarned = 0;
  nextClaimTime = '24:00:00';
  calendarDays: DailyClaimStatus['calendarDays'] = [];

  // UI state
  isFlipped = false;
  isTotalFlipped = false;
  isInfoOpen = false;
  isClaiming = false;
  showSuccessBanner = false;

  // Calendar navigation
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Timer
  private timerInterval: any;

  async ngOnInit(): Promise<void> {
    await this.loadStatus();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  toggleTheme(): void {
    const next = this.themeService.toggleTheme();
    this.isDarkMode = next === 'dark';
  }

  async loadStatus(): Promise<void> {
    try {
      const status = await this.dailyClaimService.getStatus(this.username);
      this.claimedToday = status.claimedToday;
      this.streak = status.streak;
      this.totalDays = status.totalDays;
      this.totalEarned = status.totalEarned;
      this.nextClaimTime = status.nextClaimTime;
      this.calendarDays = status.calendarDays;

      if (this.claimedToday) {
        this.showSuccessBanner = true;
        this.startCountdownFromServer();
      }
    } catch (error) {
      console.error('Error loading daily claim status:', error);
    }
  }

  async claimDaily(): Promise<void> {
    if (this.claimedToday || this.isClaiming) return;

    this.isClaiming = true;
    try {
      await this.dailyClaimService.claim(this.username);
      this.claimedToday = true;
      this.showSuccessBanner = true;
      this.streak++;
      this.totalDays++;
      this.totalEarned += 140;

      // Flip cards to show rewards
      this.flipCards();

      // Reload full status from server
      await this.loadStatus();

      // Start countdown
      this.nextClaimTime = '24:00:00';
      this.startCountdown(24 * 60 * 60);
    } catch (error: any) {
      if (error.status === 409) {
        this.claimedToday = true;
        this.showSuccessBanner = true;
      }
    } finally {
      this.isClaiming = false;
    }
  }

  private startCountdown(seconds: number): void {
    let remaining = seconds;
    const display = document.getElementById('countdown-timer-display');

    const update = () => {
      const h = Math.floor(remaining / 3600);
      const m = Math.floor((remaining % 3600) / 60);
      const s = remaining % 60;
      const formatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      if (display) {
        display.textContent = formatted;
      }
      this.nextClaimTime = formatted;

      if (remaining <= 0) {
        clearInterval(this.timerInterval);
        this.claimedToday = false;
        this.showSuccessBanner = false;
      } else {
        remaining--;
      }
    };

    update();
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(update, 1000);
  }

  private startCountdownFromServer(): void {
    if (!this.nextClaimTime) return;
    const parts = this.nextClaimTime.split(':').map(Number);
    if (parts.length === 3) {
      const totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (totalSeconds > 0) {
        this.startCountdown(totalSeconds);
      }
    }
  }

  flipCards(): void {
    this.isFlipped = true;
    this.isTotalFlipped = true;
    setTimeout(() => {
      this.isFlipped = false;
      this.isTotalFlipped = false;
    }, 18000);
  }

  toggleInfo(): void {
    this.isInfoOpen = !this.isInfoOpen;
  }

  // Calendar helpers
  get calendarTitle(): string {
    return `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
  }

  canGoPrev(): boolean {
    // Can go back up to 6 months
    const minDate = new Date();
    minDate.setMonth(minDate.getMonth() - 6);
    return new Date(this.currentYear, this.currentMonth) > minDate;
  }

  canGoNext(): boolean {
    return this.currentMonth !== new Date().getMonth() || this.currentYear !== new Date().getFullYear();
  }

  prevMonth(): void {
    if (!this.canGoPrev()) return;
    const d = new Date(this.currentYear, this.currentMonth - 1);
    this.currentMonth = d.getMonth();
    this.currentYear = d.getFullYear();
  }

  nextMonth(): void {
    if (!this.canGoNext()) return;
    const d = new Date(this.currentYear, this.currentMonth + 1);
    this.currentMonth = d.getMonth();
    this.currentYear = d.getFullYear();
  }

  getCalendarDays(): Array<{ day: number; status: string }> {
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const today = new Date();

    const result: Array<{ day: number; status: string }> = [];

    // Fill leading empty cells for alignment
    // Actually we return day numbers, empty days handled in template

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(this.currentYear, this.currentMonth, d);
      let status = 'future';

      if (date < today) {
        // Past day — check if it was claimed
        const found = this.calendarDays.find(cd =>
          cd.day === d && cd.month === (this.currentMonth + 1) && cd.year === this.currentYear
        );
        status = found ? found.status : 'missed';
      } else if (date.toDateString() === today.toDateString()) {
        const found = this.calendarDays.find(cd =>
          cd.day === d && cd.month === (this.currentMonth + 1) && cd.year === this.currentYear
        );
        status = found ? found.status : 'current';
      }

      result.push({ day: d, status });
    }

    return result;
  }

  get firstDayOffset(): number {
    return new Date(this.currentYear, this.currentMonth, 1).getDay();
  }

  get prevMonthDays(): number[] {
    const daysInPrev = new Date(this.currentYear, this.currentMonth, 0).getDate();
    const offset = this.firstDayOffset;
    const result: number[] = [];
    for (let i = offset - 1; i >= 0; i--) {
      result.push(daysInPrev - i);
    }
    return result;
  }
}