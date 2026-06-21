import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BotPlanDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  dailyProfitEstimate: number;
  durationDays: number;
  tradingPair: string;
  winRate?: number;
  isFreeTier: boolean;
  freeTierMaxUses?: number;
  imageUrl?: string;
  exchanges?: string[];
  stockMax: number;
  buyPercentage: number;
  sellPercentage: number;
  iconColor: string;
  totalProfitEstimate: number;
}

export interface UserActivePlanDTO {
  id: number;
  botPlanId: number;
  botPlanName: string;
  botPlanImageUrl?: string;
  startedAt: string;
  expiresAt: string;
  lastTradeAt: string;
  accumulatedProfit: number;
  status: 'Active' | 'Paused';
  tradingPair: string;
  dailyProfitEstimate: number;
  acquisitionCost?: number;
}

export interface UserFreeUsageDTO {
  botPlanId: number;
  usageCount: number;
  firstUsedAt?: string;
  lastUsedAt?: string;
  isEligible: boolean;
}

export interface DeployBotRequest {
  username: string;
  botPlanId: number;
}

export interface DeployBotResponse {
  success: boolean;
  message: string;
  activePlanId: number;
  expiresAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class BotPlanService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Get all available bot plans
   */
  async getAvailableBots(): Promise<BotPlanDTO[]> {
    const url = `${this.apiUrl}/BotPlans`;
    try {
      const response = await firstValueFrom(this.http.get<BotPlanDTO[]>(url));
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user's active bot plans
   */
  async getMyActiveBots(username: string): Promise<UserActivePlanDTO[]> {
    const url = `${this.apiUrl}/BotPlans/MyBots/${username}`;
    try {
      const response = await firstValueFrom(this.http.get<UserActivePlanDTO[]>(url));
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user's free tier usage for tracking free bot claims
   */
  async getFreeUsage(username: string): Promise<UserFreeUsageDTO[]> {
    const url = `${this.apiUrl}/BotPlans/FreeUsage/${username}`;
    try {
      const response = await firstValueFrom(this.http.get<UserFreeUsageDTO[]>(url));
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Deploy a bot plan
   */
  async deployBot(request: DeployBotRequest): Promise<DeployBotResponse> {
    const url = `${this.apiUrl}/BotPlans/Deploy`;
    try {
      const response = await firstValueFrom(this.http.post<DeployBotResponse>(url, request));
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Pause an active bot
   */
  async pauseBot(activePlanId: number): Promise<{ message: string; status: string }> {
    const url = `${this.apiUrl}/BotPlans/${activePlanId}/Pause`;
    try {
      const response = await firstValueFrom(this.http.post<{ message: string; status: string }>(url, {}));
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Resume a paused bot
   */
  async resumeBot(activePlanId: number): Promise<{ message: string; status: string }> {
    const url = `${this.apiUrl}/BotPlans/${activePlanId}/Resume`;
    try {
      const response = await firstValueFrom(this.http.post<{ message: string; status: string }>(url, {}));
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle HTTP errors and return user-friendly messages
   */
  private handleError(error: any): string {
    if (error.error && typeof error.error === 'object') {
      if (error.error.message) {
        return error.error.message;
      }
    } else if (error.error && typeof error.error === 'string') {
      return error.error;
    }
    
    // Handle specific HTTP status codes
    if (error.status === 400) {
      return 'Solicitud inválida. Verifica los datos e intenta nuevamente.';
    } else if (error.status === 401) {
      return 'Sesión expirada. Por favor inicia sesión nuevamente.';
    } else if (error.status === 404) {
      return 'Recurso no encontrado.';
    } else if (error.status === 500) {
      return 'Error del servidor. Intenta más tarde.';
    }
    
    return 'Error de conexión. Verifica tu internet e intenta nuevamente.';
  }
}
