import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AuthModalComponent } from './auth-modal.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { NotificationService } from '../../../services/products/notification.service';

class MockNotificationService {
  correct(msg: string) {}
  errorMessage(msg: string) {}
}

describe('AuthModalComponent', () => {
  let component: AuthModalComponent;
  let fixture: ComponentFixture<AuthModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthModalComponent, HttpClientTestingModule],
      providers: [
        provideRouter([]),
        { provide: NotificationService, useValue: new MockNotificationService() }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render registration view when mode is reg', () => {
    fixture.componentRef.setInput('mode', 'reg');
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('#view-reg .form-view-title');
    expect(title).toBeTruthy();
    expect(title.textContent).toContain('Crear cuenta');
  });

  it('should render login view when mode is log', () => {
    fixture.componentRef.setInput('mode', 'log');
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('#view-log .form-view-title');
    expect(title).toBeTruthy();
    expect(title.textContent).toContain('Iniciar sesión');
  });

  it('should update flag when country code is entered', () => {
    fixture.componentRef.setInput('mode', 'reg');
    fixture.detectChanges();
    component.regForm.patchValue({ countryCode: '57' });
    component.onCountryCodeChange('reg');
    fixture.detectChanges();
    expect(component.regFlag).toBe('🇨🇴');
  });

  it('should show globe flag for unknown country code', () => {
    fixture.componentRef.setInput('mode', 'reg');
    fixture.detectChanges();
    component.regForm.patchValue({ countryCode: '99' });
    component.onCountryCodeChange('reg');
    fixture.detectChanges();
    expect(component.regFlag).toBe('🌐');
  });

  it('should evaluate password strength as empty when password is empty', () => {
    const strength = component.evaluatePasswordStrength('');
    expect(strength.label).toBe('Vacía');
    expect(strength.bars).toBe(0);
  });

  it('should evaluate password strength as insecure for short password', () => {
    const strength = component.evaluatePasswordStrength('abc');
    expect(strength.label).toBe('Insegura');
    expect(strength.bars).toBe(1);
  });

  it('should evaluate password strength as secure for medium password', () => {
    const strength = component.evaluatePasswordStrength('abcdef');
    expect(strength.label).toBe('Segura');
    expect(strength.bars).toBe(2);
  });

  it('should evaluate password strength as very secure for long password', () => {
    const strength = component.evaluatePasswordStrength('abcdefghi');
    expect(strength.label).toBe('Muy segura');
    expect(strength.bars).toBe(4);
  });

  it('should start SMS timer when sendSMS is called', fakeAsync(() => {
    fixture.componentRef.setInput('mode', 'reg');
    fixture.detectChanges();
    component.regForm.patchValue({ countryCode: '57', phone: '3001234567' });
    component.sendSMS();
    expect(component.smsTimer).toBe(60);
    tick(1000);
    expect(component.smsTimer).toBe(59);
    tick(59000);
    expect(component.smsTimer).toBe(0);
  }));

  it('should toggle password visibility', () => {
    component.togglePasswordVisibility('reg');
    expect(component.regPasswordType).toBe('text');
    component.togglePasswordVisibility('reg');
    expect(component.regPasswordType).toBe('password');
  });

  it('should disable submit when registration form is invalid', () => {
    fixture.componentRef.setInput('mode', 'reg');
    fixture.detectChanges();
    expect(component.isRegFormValid()).toBe(false);
  });

  it('should enable submit when registration form is valid', () => {
    fixture.componentRef.setInput('mode', 'reg');
    fixture.detectChanges();
    component.regForm.patchValue({
      countryCode: '57',
      phone: '3001234567',
      smsCode: '123456',
      password: 'password123',
      confirmPassword: 'password123',
    });
    component.passwordStrength = { label: 'Muy segura', bars: 4, color: 'var(--accent-green)' };
    fixture.detectChanges();
    expect(component.isRegFormValid()).toBe(true);
  });

  it('should disable submit when login form is invalid', () => {
    fixture.componentRef.setInput('mode', 'log');
    fixture.detectChanges();
    expect(component.isLoginFormValid()).toBe(false);
  });

  it('should enable submit when login form is valid', () => {
    fixture.componentRef.setInput('mode', 'log');
    fixture.detectChanges();
    component.logForm.patchValue({
      countryCode: '57',
      phone: '3001234567',
      password: 'anypass',
    });
    fixture.detectChanges();
    expect(component.isLoginFormValid()).toBe(true);
  });

  it('should have locked team code value', () => {
    fixture.componentRef.setInput('mode', 'reg');
    fixture.detectChanges();
    const teamCode = component.regForm.get('teamCode')?.value;
    expect(teamCode).toBe('TV-GLOBAL-2026');
  });
});
