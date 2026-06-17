import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { WithdrawComponent } from './withdraw.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NotificationService } from '../../services/products/notification.service';
import { TelegramService } from '../../services/products/Telegram.service';
import { ThemeService } from '../../services/theme.service';
import { By } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

class MockNotificationService {
  correct = jasmine.createSpy('correct');
  errorMessage = jasmine.createSpy('errorMessage');
}

class MockTelegramService {
  sendMessage = jasmine.createSpy('sendMessage');
}

class MockThemeService {
  private theme = 'dark';
  setTheme(theme: string) { this.theme = theme; document.body.setAttribute('data-theme', theme); }
  toggleTheme() { const next = this.theme === 'dark' ? 'light' : 'dark'; this.setTheme(next); return next; }
  getTheme() { return this.theme; }
}

describe('WithdrawComponent', () => {
  let component: WithdrawComponent;
  let fixture: ComponentFixture<WithdrawComponent>;
  let httpMock: HttpTestingController;
  let notificationService: MockNotificationService;
  let telegramService: MockTelegramService;

  beforeEach(async () => {
    notificationService = new MockNotificationService();
    telegramService = new MockTelegramService();

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'username') return 'testuser';
      return null;
    });

    await TestBed.configureTestingModule({
      imports: [WithdrawComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: NotificationService, useValue: notificationService },
        { provide: TelegramService, useValue: telegramService },
        { provide: ThemeService, useClass: MockThemeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WithdrawComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    // Set token to COP so initial balance request uses coin=COP
    component.token = 'nequi';
    fixture.detectChanges();

    // Flush initial ngOnInit balance request
    httpMock.expectOne(`${environment.apiUrl}/Wallet/GetBalance/testuser?coin=COP`).flush('5000000');
    fixture.detectChanges();
  });

  afterEach(() => {
    if (httpMock) {
      httpMock.verify();
    }
    if (fixture) {
      fixture.destroy();
    }
  });

  // ─── 1. Password Modal ───────────────────────────────
  it('should open password modal when there is an amount entered', () => {
    component.amount = 50000;
    component.openPasswordModal();
    expect(component.showPasswordModal).toBeTrue();
  });

  it('should NOT open password modal when amount is zero or null', () => {
    component.amount = null;
    component.openPasswordModal();
    expect(component.showPasswordModal).toBeFalse();

    component.amount = 0;
    component.openPasswordModal();
    expect(component.showPasswordModal).toBeFalse();
  });

  it('should validate 4-digit numeric input in password modal', () => {
    spyOn(window, 'alert');
    component.showPasswordModal = true;

    // Too short
    component.modalPassword = '123';
    component.confirmWithdrawal();
    expect(window.alert).toHaveBeenCalledWith('La contraseña de retiro debe tener exactamente 4 dígitos.');
    expect(component.showPasswordModal).toBeTrue();

    // Too long
    component.modalPassword = '12345';
    component.confirmWithdrawal();
    expect(window.alert).toHaveBeenCalledWith('La contraseña de retiro debe tener exactamente 4 dígitos.');
    expect(component.showPasswordModal).toBeTrue();

    // Empty
    component.modalPassword = '';
    component.confirmWithdrawal();
    expect(window.alert).toHaveBeenCalledWith('La contraseña de retiro debe tener exactamente 4 dígitos.');

    // Exactly 4 digits — should pass validation and close modal
    spyOn(component, 'requestWithdrawal').and.returnValue(Promise.resolve());
    component.modalPassword = '1234';
    component.amount = 50000;
    component.accountNumber = '3001234567';
    component.captchaInput = component.activeCaptcha;
    component.confirmWithdrawal();
    expect(component.showPasswordModal).toBeFalse();
    expect(component.requestWithdrawal).toHaveBeenCalled();
  });

  it('should call verifyWithdrawPassword API when confirming withdrawal', fakeAsync(() => {
    component.amount = 50000;
    component.accountNumber = '3001234567';
    component.captchaInput = component.activeCaptcha;
    component.password = '1234';
    component.canSubmit = true;

    component.requestWithdrawal();
    tick();

    // First API: CanWithdraw
    const canWithdrawReq = httpMock.expectOne(`${environment.apiUrl}/Wallet/CanWithdraw`);
    canWithdrawReq.flush({ canWithdraw: true });
    tick();

    // Second API: VerifyWithdrawPassword
    const verifyReq = httpMock.expectOne(`${environment.apiUrl}/User/VerifyWithdrawPassword`);
    expect(verifyReq.request.body).toEqual(jasmine.objectContaining({
      Email: 'testuser',
      Password: '1234',
      PhoneNumber: 'testuser'
    }));
    verifyReq.flush({});
    tick();

    // Third API: RequestWithdrawal
    const withdrawalReq = httpMock.expectOne(`${environment.apiUrl}/Wallet/RequestWithdrawal`);
    withdrawalReq.flush({
      message: 'OK',
      amount: 50000,
      fee: 7500,
      netAmount: 42500,
      token: 'nequi',
      ordenId: 'ORD-123'
    });
    tick();

    flush();
  }));

  it('should close password modal on cancel', () => {
    component.showPasswordModal = true;
    component.modalPassword = '1234';
    component.showPassword = true;

    component.closePasswordModal();

    expect(component.showPasswordModal).toBeFalse();
    expect(component.modalPassword).toBe('');
    expect(component.showPassword).toBeFalse();
  });

  // ─── 2. Quick Amounts ────────────────────────────────
  it('should set correct amount when quick amount is clicked', () => {
    component.token = 'nequi';
    const quickAmounts = component.quickAmounts;
    expect(quickAmounts).toContain(10000);
    expect(quickAmounts).toContain(50000);
    expect(quickAmounts).toContain(1000000);

    component.setAmount(20000);
    expect(component.amount).toBe(20000);
    expect(component.rawAmount).toBe(20000);
  });

  it('should set correct quick amounts for USDT tokens', () => {
    component.token = 'usdt-trc20';
    const quickAmounts = component.quickAmounts;
    expect(quickAmounts).toContain(5);
    expect(quickAmounts).toContain(100);
    expect(quickAmounts).toContain(1000);
  });

  // ─── 3. MAX Button ───────────────────────────────────
  it('should set the full balance when MAX button is clicked', () => {
    component.balance = '5000000';
    component.setMaxAmount();
    expect(component.amount).toBe(5000000);
    expect(component.rawAmount).toBe(5000000);
  });

  it('should set MAX amount to parsed float of balance', () => {
    component.balance = '1250.50';
    component.setMaxAmount();
    expect(component.amount).toBe(1250.50);
  });

  // ─── 4. Fee Calculation ──────────────────────────────
  it('should calculate fee correctly at 15%', () => {
    component.amount = 100000;
    component.validate();
    expect(component.withdrawalFee).toBe(15000);
    expect(component.amountToReceive).toBe(85000);
  });

  it('should calculate fee as zero when amount is below minimum', () => {
    component.amount = 5000;
    component.validate();
    expect(component.withdrawalFee).toBe(0);
    expect(component.amountToReceive).toBe(0);
  });

  it('should display fee amount string correctly', () => {
    component.amount = 100000;
    component.validate();
    expect(component.feeAmount).toBe('$15,000');
  });

  it('should display received amount string correctly', () => {
    component.amount = 100000;
    component.validate();
    expect(component.receivedAmount).toBe('$85,000');
  });

  // ─── 5. Amount Validation ──────────────────────────────
  it('should mark amount as invalid when below minimum', () => {
    component.token = 'nequi';
    component.amount = 10000; // Below MIN_AMOUNT_COP (20000)
    component.validate();
    expect(component.amountValid).toBeFalse();
    expect(component.amountInvalid).toBeTrue();
    expect(component.insuficient).toBeFalse();
  });

  it('should mark amount as invalid when exceeding balance', () => {
    component.balance = '5000000';
    component.amount = 6000000;
    component.validate();
    expect(component.amountValid).toBeFalse();
    expect(component.insuficient).toBeTrue();
  });

  it('should mark amount as valid when within range and sufficient balance', () => {
    component.balance = '5000000';
    component.amount = 100000;
    component.validate();
    expect(component.amountValid).toBeTrue();
    expect(component.amountInvalid).toBeFalse();
    expect(component.insuficient).toBeFalse();
  });

  it('should reset validation when amount is null', () => {
    component.amount = null;
    component.validate();
    expect(component.amountValid).toBeFalse();
    expect(component.amountInvalid).toBeFalse();
    expect(component.insuficient).toBeFalse();
    expect(component.amountHintColor).toBe('rgba(255,255,255,0.3)');
  });

  // ─── 6. Submit Button ─────────────────────────────────
  it('should disable submit until all fields are valid', () => {
    // Initially all empty
    component.amount = null;
    component.accountNumber = '';
    component.password = '';
    component.captchaInput = '';
    component.validate();
    expect(component.canSubmit).toBeFalse();

    // Only amount filled
    component.amount = 50000;
    component.validate();
    expect(component.canSubmit).toBeFalse();

    // Amount + account but no captcha/password
    component.accountNumber = '3001234567';
    component.validate();
    expect(component.canSubmit).toBeFalse();

    // Amount + account + captcha but no password
    component.captchaInput = component.activeCaptcha;
    component.validate();
    expect(component.canSubmit).toBeFalse();

    // All fields filled
    component.password = '1234';
    component.validate();
    expect(component.canSubmit).toBeTrue();
  });

  it('should disable submit when amount is below minimum even with all fields filled', () => {
    component.amount = 10000; // Below minimum
    component.accountNumber = '3001234567';
    component.password = '1234';
    component.captchaInput = component.activeCaptcha;
    component.validate();
    expect(component.canSubmit).toBeFalse();
  });

  // ─── 7. Template Rendering ────────────────────────────
  it('should render submit button disabled when rawAmount <= 0', () => {
    component.amount = null;
    fixture.detectChanges();
    const submitBtn = fixture.debugElement.query(By.css('.btn-submit'));
    expect(submitBtn.nativeElement.disabled).toBeTrue();
  });

  it('should render submit button enabled when rawAmount > 0', () => {
    component.amount = 50000;
    fixture.detectChanges();
    const submitBtn = fixture.debugElement.query(By.css('.btn-submit'));
    expect(submitBtn.nativeElement.disabled).toBeFalse();
  });

  it('should render quick amount buttons', () => {
    const quickButtons = fixture.debugElement.queryAll(By.css('.btn-quick-amount'));
    expect(quickButtons.length).toBe(8);
  });

  it('should render MAX button', () => {
    const maxBtn = fixture.debugElement.query(By.css('.btn-max'));
    expect(maxBtn).toBeTruthy();
  });

  it('should render password modal with active class when showPasswordModal is true', () => {
    component.showPasswordModal = true;
    fixture.detectChanges();
    const modal = fixture.debugElement.query(By.css('.modal-overlay'));
    expect(modal).toBeTruthy();
    expect(modal.classes['active']).toBeTrue();
  });

  it('should render password modal without active class when showPasswordModal is false', () => {
    component.showPasswordModal = false;
    fixture.detectChanges();
    const modal = fixture.debugElement.query(By.css('.modal-overlay'));
    expect(modal).toBeTruthy();
    expect(modal.classes['active']).toBeFalsy();
  });

  // ─── 8. Currency-specific Logic ───────────────────────
  it('should detect COP tokens correctly', () => {
    component.token = 'nequi';
    expect(component.isCOP).toBeTrue();
    expect(component.currency).toBe('COP');

    component.token = 'daviplata';
    expect(component.isCOP).toBeTrue();

    component.token = 'usdt-trc20';
    expect(component.isCOP).toBeFalse();
    expect(component.currency).toBe('USDT');

    component.token = 'usdt-bep20';
    expect(component.isCOP).toBeFalse();
  });

  it('should compute correct MIN_AMOUNT for USDT', () => {
    component.token = 'usdt-trc20';
    const expectedMin = 20000 / 3600; // ~5.56
    expect(component.MIN_AMOUNT).toBeCloseTo(expectedMin, 2);
  });

  it('should compute correct MAX_AMOUNT for USDT', () => {
    component.token = 'usdt-bep20';
    const expectedMax = 10000000 / 3600; // ~2777.78
    expect(component.MAX_AMOUNT).toBeCloseTo(expectedMax, 2);
  });
});
