import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle.component';
import { TradingChartComponent } from './trading-chart/trading-chart.component';
import { PartnersCarouselComponent } from './partners-carousel/partners-carousel.component';
import { AuthModalComponent } from './auth-modal/auth-modal.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NotificationService } from '../../services/products/notification.service';
import { ThemeService } from '../../services/theme.service';

class MockNotificationService {
  correct(msg: string) {}
  errorMessage(msg: string) {}
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ThemeToggleComponent,
        TradingChartComponent,
        PartnersCarouselComponent,
        AuthModalComponent,
        HttpClientTestingModule,
      ],
      providers: [
        provideRouter([]),
        ThemeService,
        { provide: NotificationService, useValue: new MockNotificationService() }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render header with brand title', () => {
    const brand = fixture.nativeElement.querySelector('.brand-title');
    expect(brand).toBeTruthy();
    expect(brand.textContent).toContain('Trading');
  });

  it('should render hero viewport', () => {
    const hero = fixture.nativeElement.querySelector('.hero-viewport');
    expect(hero).toBeTruthy();
  });

  it('should render trading chart component', () => {
    const chart = fixture.nativeElement.querySelector('app-trading-chart');
    expect(chart).toBeTruthy();
  });

  it('should render partners carousel component', () => {
    const carousel = fixture.nativeElement.querySelector('app-partners-carousel');
    expect(carousel).toBeTruthy();
  });

  it('should render theme toggle component', () => {
    const toggle = fixture.nativeElement.querySelector('app-theme-toggle');
    expect(toggle).toBeTruthy();
  });

  it('should render info cards', () => {
    const cards = fixture.nativeElement.querySelectorAll('.info-card');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should open auth modal in reg mode when openAuthModal is called with reg', () => {
    component.openAuthModal('reg');
    fixture.detectChanges();
    expect(component.authMode).toBe('reg');
    expect(component.authOpen).toBe(true);
  });

  it('should open auth modal in log mode when openAuthModal is called with log', () => {
    component.openAuthModal('log');
    fixture.detectChanges();
    expect(component.authMode).toBe('log');
    expect(component.authOpen).toBe(true);
  });

  it('should close auth modal', () => {
    component.openAuthModal('reg');
    fixture.detectChanges();
    component.closeAuthModal();
    fixture.detectChanges();
    expect(component.authOpen).toBe(false);
  });

  it('should toggle dropdown menu', () => {
    expect(component.dropdownOpen).toBe(false);
    component.toggleDropdown();
    expect(component.dropdownOpen).toBe(true);
    component.toggleDropdown();
    expect(component.dropdownOpen).toBe(false);
  });

  it('should close dropdown when closeDropdown is called', () => {
    component.dropdownOpen = true;
    component.closeDropdown();
    expect(component.dropdownOpen).toBe(false);
  });

  it('should close dropdown when clicking on hero viewport', () => {
    component.dropdownOpen = true;
    fixture.detectChanges();
    const hero = fixture.nativeElement.querySelector('.hero-viewport');
    hero.click();
    fixture.detectChanges();
    expect(component.dropdownOpen).toBe(false);
  });
});
