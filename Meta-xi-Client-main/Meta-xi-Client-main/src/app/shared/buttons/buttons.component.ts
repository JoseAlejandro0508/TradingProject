import { Component, OnInit, OnDestroy, inject, Renderer2 } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './buttons.component.html',
  styleUrl: './buttons.component.scss',
})
export class ButtonsComponent implements OnInit, OnDestroy {
  currentUrl = '';
  activeIndex = 0;
  indicatorTransform = 'translateX(0px)';

  private router = inject(Router);
  private renderer = inject(Renderer2);
  private routerSub!: Subscription;

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    this.updateActiveIndex(this.currentUrl);

    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
        this.updateActiveIndex(this.currentUrl);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  get isLogined(): boolean {
    return this.currentUrl === '/login';
  }

  isActive(path: string): boolean {
    return this.currentUrl === path || this.currentUrl.startsWith(path);
  }

  updateActiveIndex(url: string): void {
    if (url === '/home' || url === '/' || url === '') {
      this.activeIndex = 0;
    } else if (url === '/plans' || url.startsWith('/plans')) {
      this.activeIndex = 1;
    } else if (url.startsWith('/home')) {
      this.activeIndex = 0;
    } else if (url === '/me') {
      this.activeIndex = 2;
    } else if (url.startsWith('/me')) {
      this.activeIndex = 2;
    } else if (url === '/profile' || url.startsWith('/profile')) {
      this.activeIndex = 3;
    } else {
      this.activeIndex = 0;
    }
    this.indicatorTransform = `translateX(${this.activeIndex * 88}px)`;
  }

  onItemClick(event: Event, index: number, path: string): void {
    this.activeIndex = index;
    this.indicatorTransform = `translateX(${index * 88}px)`;

    const element = event.currentTarget as HTMLElement;
    if (element) {
      this.createRipple(element);
    }

    if (path !== '#') {
      this.router.navigate([path]);
    }
  }

  createRipple(element: HTMLElement): void {
    const oldRipple = element.querySelector('.ripple');
    if (oldRipple) {
      this.renderer.removeChild(element, oldRipple);
    }

    const circle = this.renderer.createElement('span');
    this.renderer.addClass(circle, 'ripple');

    const diameter = Math.max(element.clientWidth, element.clientHeight);
    this.renderer.setStyle(circle, 'width', `${diameter}px`);
    this.renderer.setStyle(circle, 'height', `${diameter}px`);
    this.renderer.setStyle(circle, 'left', `${element.clientWidth / 2 - diameter / 2}px`);
    this.renderer.setStyle(circle, 'top', `${element.clientHeight / 2 - diameter / 2}px`);

    this.renderer.appendChild(element, circle);

    // Auto-remove after animation completes
    setTimeout(() => {
      if (circle.parentNode) {
        this.renderer.removeChild(element, circle);
      }
    }, 500);
  }
}
