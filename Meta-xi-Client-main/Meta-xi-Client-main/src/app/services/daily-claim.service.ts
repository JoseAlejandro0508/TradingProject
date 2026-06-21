import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DayStatus {
  day: number;
  month: number;
  year: number;
  status: 'checked' | 'missed' | 'current' | 'future';
}

export interface DailyClaimStatus {
  claimedToday: boolean;
  streak: number;
  totalDays: number;
  totalEarned: number;
  nextClaimTime: string;
  calendarDays: DayStatus[];
}

@Injectable({
  providedIn: 'root'
})
export class DailyClaimService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getStatus(username: string): Promise<DailyClaimStatus> {
    return firstValueFrom(
      this.http.get<DailyClaimStatus>(`${this.apiUrl}/DailyClaim/status/${username}`)
    );
  }

  claim(email: string): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.apiUrl}/DailyClaim/claim`, { email })
    );
  }
}