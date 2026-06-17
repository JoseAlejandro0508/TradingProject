import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BackHomeComponent } from '../../shared/back-home/back-home.component';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-withdraw-token',
  standalone: true,
  imports: [BackHomeComponent, RouterLink],
  templateUrl: './withdrawToken.component.html',
  styleUrl: './withdrawToken.component.scss',
})
export class WithdrawTokenComponent {
  private router = inject(Router);
  private themeService = inject(ThemeService);

  goToWithdraw(token: string) {
    this.router.navigate(['/withdraw', token]);
  }
}
