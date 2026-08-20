import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationService } from './notification.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TelegramService {
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);
  private telegramApiUrl = `${environment.apiUrl}/Telegram`;

  constructor() {}

  sendPhoto(photo: File, caption: string): void {
    const formData = new FormData();
    formData.append('photo', photo);
    formData.append('caption', caption);

    this.http.post(`${this.telegramApiUrl}/send-photo`, formData).subscribe({
      next: (response) => {
        console.log('Photo sent successfully:', response);
        this.notificationService.correct('Foto enviada correctamente.');
      },
      error: (err) => {
        console.error('Error sending photo:', err);
        this.notificationService.errorMessage(
          'Error al enviar la foto. Inténtalo nuevamente.'
        );
      },
    });
  }

  sendMessage$(message: string, token?: string): Observable<any> {
    const payload = {
      Message: message,
      CustomToken: token,

    };
    return this.http.post(`${this.telegramApiUrl}/send-message`, payload);
  }

  sendMessage(message: string, token?: string): void {
    this.sendMessage$(message, token).subscribe({
      next: (response) => {
        console.log('Message sent successfully:', response);
        this.notificationService.correct('Mensaje enviado correctamente.');
      },
      error: (err) => {
        console.error('Error sending message:', err);
        this.notificationService.errorMessage(
          'Error al enviar el mensaje. Inténtalo nuevamente.'
        );
      },
    });
  }
}
