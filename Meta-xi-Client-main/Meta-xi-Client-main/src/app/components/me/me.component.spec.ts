import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { MeComponent } from './me.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
registerLocaleData(localeEs);
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { NotificationService } from '../../services/products/notification.service';
import { By } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

class MockThemeService {
  private theme = 'dark';
  setTheme(theme: string) { this.theme = theme; document.body.setAttribute('data-theme', theme); }
  toggleTheme() { const next = this.theme === 'dark' ? 'light' : 'dark'; this.setTheme(next); return next; }
  getTheme() { return this.theme; }
}

class MockNotificationService {
  correct = jasmine.createSpy('correct');
  errorMessage = jasmine.createSpy('errorMessage');
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('MeComponent', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;
  let httpMock: HttpTestingController;
  let themeService: MockThemeService;
  let notificationService: MockNotificationService;
  beforeEach(async () => {
    themeService = new MockThemeService();
    notificationService = new MockNotificationService();

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'username') return 'testuser';
      return null;
    });
    spyOn(localStorage, 'removeItem');
    spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [MeComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: ThemeService, useValue: themeService },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    // Flush initial ngOnInit requests
    httpMock.expectOne(`${environment.apiUrl}/Wallet/GetBalanceUsdAndCop/testuser`).flush({ balanceInUsd: '1000.00', balanceInCop: 5000000 });
    httpMock.expectOne(`${environment.apiUrl}/User/GetLink/testuser`).flush({ link: 'https://example.com/ref' });
    httpMock.expectOne(`${environment.apiUrl}/Wallet/GetAccountSummary/testuser`).flush({ yesterday: 100, today: 50, month: 500, team: 200, total: 1000 });
    fixture.detectChanges();
  });

  afterEach(() => {
    if (component) {
      component.ngOnDestroy();
    }
    if (httpMock) {
      httpMock.verify();
    }
    if (fixture) {
      fixture.destroy();
    }
  });

  // ─── 1.1 ThemeService ───────────────────────────────
  it('should have ThemeService injected and default isDarkMode to true', () => {
    expect(component.isDarkMode).toBeTrue();
  });

  it('should toggle theme via ThemeService and update isDarkMode', () => {
    spyOn(themeService, 'toggleTheme').and.returnValue('light');
    component.toggleTheme();
    expect(themeService.toggleTheme).toHaveBeenCalled();
    expect(component.isDarkMode).toBeFalse();
  });

  // ─── 1.2 Accordion / Chat / Bot State ─────────────────
  it('should initialize accordion map with all sections closed', () => {
    expect(component.accordionOpen['acc-deposits']).toBeFalse();
    expect(component.accordionOpen['acc-withdraws']).toBeFalse();
    expect(component.accordionOpen['acc-details']).toBeFalse();
    expect(component.accordionOpen['acc-bots']).toBeFalse();
    expect(component.accordionOpen['acc-security']).toBeFalse();
  });

  it('should initialize chat arrays and bot arrays', () => {
    expect(component.chatMessages.length).toBe(1);
    expect(component.chatMessages[0].type).toBe('system');
    expect(component.bots).toEqual(jasmine.any(Array));
    expect(component.bots.length).toBeGreaterThan(0);
  });

  // ─── 1.3 Data Properties ────────────────────────────
  it('should initialize depositHistory, withdrawHistory, accountDetails, chatOpen', () => {
    expect(component.depositHistory).toEqual([]);
    expect(component.withdrawHistory).toEqual([]);
    expect(component.accountDetails).toEqual(jasmine.any(Object));
    expect(component.chatOpen).toBeFalse();
  });

  // ─── 2.1/2.2 Template Rendering ──────────────────────
  it('should render balance card', () => {
    const balanceCard = fixture.debugElement.query(By.css('.balance-card'));
    expect(balanceCard).toBeTruthy();
  });

  it('should render action buttons', () => {
    const depositBtn = fixture.debugElement.query(By.css('.btn-deposit'));
    const withdrawBtn = fixture.debugElement.query(By.css('.btn-withdraw'));
    expect(depositBtn).toBeTruthy();
    expect(withdrawBtn).toBeTruthy();
  });

  it('should render 5 accordion sections', () => {
    const accordions = fixture.debugElement.queryAll(By.css('.filter-accordion'));
    expect(accordions.length).toBe(5); // deposits, withdraws, details, bots, security
  });

  it('should render trading bot panel', () => {
    const botPanel = fixture.debugElement.query(By.css('.trading-bot-panel'));
    expect(botPanel).toBeTruthy();
  });

  it('should render support trigger', () => {
    const trigger = fixture.debugElement.query(By.css('.support-trigger'));
    expect(trigger).toBeTruthy();
  });

  it('should render theme toggle button', () => {
    const toggle = fixture.debugElement.query(By.css('.theme-toggle-btn'));
    expect(toggle).toBeTruthy();
  });

  // ─── 2.3 Lucide removed ─────────────────────────────
  it('should not contain data-lucide attributes', () => {
    const lucideElements = fixture.debugElement.queryAll(By.css('[data-lucide]'));
    expect(lucideElements.length).toBe(0);
  });

  // ─── 3.1 Balance API ────────────────────────────────
  it('should display balance from initial API call', () => {
    expect(component.balanceUSD).toBe('1000.00');
    expect(component.balanceCOP).toBe(5000000);
  });

  it('should show N/A when balance API fails', fakeAsync(() => {
    component.getMyBalance();
    const req = httpMock.expectOne(`${environment.apiUrl}/Wallet/GetBalanceUsdAndCop/testuser`);
    req.flush({}, { status: 500, statusText: 'Server Error' });
    tick();
    fixture.detectChanges();
    expect(component.balanceUSD).toBe('N/A');
    expect(component.balanceCOP).toBe(0);
  }));

  // ─── 3.2 / 3.3 History API ───────────────────────────
  it('should load deposit history via getHistory()', fakeAsync(() => {
    component.getHistory('deposit');
    const req = httpMock.expectOne(`${environment.apiUrl}/Wallet/History/testuser`);
    req.flush({ deposits: [{ amount: 100, date: '2026-01-01', status: 'approved' }] });
    tick();
    expect(component.depositHistory.length).toBe(1);
    expect(component.depositHistory[0].amountSent).toBe('100');
  }));

  it('should load withdraw history via getHistory()', fakeAsync(() => {
    component.getHistory('withdraw');
    const req = httpMock.expectOne(`${environment.apiUrl}/Wallet/History/testuser`);
    req.flush({ withdrawals: [{ amount: 50, date: '2026-01-02', status: 'pending' }] });
    tick();
    expect(component.withdrawHistory.length).toBe(1);
    expect(component.withdrawHistory[0].status).toBe('pending');
  }));

  // ─── 3.4 Account Details API ────────────────────────
  it('should load account details via getAccountDetails()', fakeAsync(() => {
    component.getAccountDetails();
    const req = httpMock.expectOne(`${environment.apiUrl}/Wallet/GetAccountSummary/testuser`);
    req.flush({ yesterday: 1000, today: 500, month: 1500, team: 2000, total: 5000 });
    tick();
    expect(component.accountDetails.total as any).toBe(5000);
  }));

  // ─── 4.1 Accordion Toggle ───────────────────────────
  it('should toggle accordion open and close others', () => {
    component.toggleAccordion('acc-deposits');
    expect(component.accordionOpen['acc-deposits']).toBeTrue();
    expect(component.accordionOpen['acc-withdraws']).toBeFalse();

    component.toggleAccordion('acc-withdraws');
    expect(component.accordionOpen['acc-withdraws']).toBeTrue();
    expect(component.accordionOpen['acc-deposits']).toBeFalse();
  });

  it('should close accordion when clicked again', () => {
    component.toggleAccordion('acc-deposits');
    expect(component.accordionOpen['acc-deposits']).toBeTrue();
    component.toggleAccordion('acc-deposits');
    expect(component.accordionOpen['acc-deposits']).toBeFalse();
  });

  // ─── 4.2 Bot Simulation ─────────────────────────────
  it('should update bot profits over time', fakeAsync(() => {
    const initial = component.bots[0].profit;
    tick(3500);
    fixture.detectChanges();
    expect(component.bots[0].profit).not.toBe(initial);
    flush();
  }));

  // ─── 4.4 Chat Send ─────────────────────────────────
  it('should send message and trigger auto-reply', fakeAsync(() => {
    component.chatOpen = true;
    component.chatInput = 'Hola';
    component.sendMessage();
    expect(component.chatMessages.length).toBe(2); // initial system + user
    expect(component.chatMessages[1].type).toBe('user');
    expect(component.chatMessages[1].text).toBe('Hola');
    tick(1100);
    expect(component.chatMessages.length).toBe(3); // + auto-reply
    expect(component.chatMessages[2].type).toBe('system');
    flush();
  }));

  it('should not send empty message', () => {
    const initialLength = component.chatMessages.length;
    component.chatInput = '   ';
    component.sendMessage();
    expect(component.chatMessages.length).toBe(initialLength);
  });

  // ─── 4.5 Media Selection ────────────────────────────
  it('should reject non-image files', () => {
    const initialLength = component.chatMessages.length;
    const file = new File(['text'], 'file.txt', { type: 'text/plain' });
    component.handleMediaSelection(file);
    expect(notificationService.errorMessage).toHaveBeenCalledWith(jasmine.any(String));
    expect(component.chatMessages.length).toBe(initialLength);
  });

  // ─── 4.7 Password Form ──────────────────────────────
  it('should submit password form and show success', fakeAsync(() => {
    component.passForm.setValue({
      oldPassword: 'OldPass1!',
      newPassword: 'NewPass1!',
      confirmPassword: 'NewPass1!',
      captchaPass: component.captchaPass,
    });
    component.validatePassForm();
    expect(component.passFormValid).toBeTrue();

    component.submitPassword();
    const req = httpMock.expectOne(`${environment.apiUrl}/User/UpdatePassword`);
    req.flush({ message: 'Updated' });
    tick();
    expect(notificationService.correct).toHaveBeenCalledWith('Updated');
  }));

  // ─── 4.8 Logout / Referral ──────────────────────────
  it('should call logout API and redirect', fakeAsync(() => {
    const injectedRouter = TestBed.inject(Router);
    spyOn(injectedRouter, 'navigate');
    component.logout();
    const req = httpMock.expectOne(`${environment.apiUrl}/User/Logout/testuser`);
    req.flush({ message: 'Logged out' });
    tick();
    expect(notificationService.correct).toHaveBeenCalled();
    tick(3000); // flush setTimeout redirect
    expect(injectedRouter.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should copy referral link', fakeAsync(() => {
    component.referralLink = 'https://example.com/ref';
    component.copyReferralLink();
    tick();
    expect(notificationService.correct).toHaveBeenCalledWith('Link copiado al portapapeles');
  }));
});
