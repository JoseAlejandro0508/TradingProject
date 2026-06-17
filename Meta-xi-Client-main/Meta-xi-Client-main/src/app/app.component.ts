import { Component } from '@angular/core';
import { BackgroundComponent } from './common/background/background.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BackgroundComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
}
