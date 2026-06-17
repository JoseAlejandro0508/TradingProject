import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WithdrawTokenComponent } from './withdrawToken.component';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ThemeService } from '../../services/theme.service';
import { By } from '@angular/platform-browser';

class MockThemeService {
  private theme = 'dark';
  setTheme(theme: string) { this.theme = theme; document.body.setAttribute('data-theme', theme); }
  toggleTheme() { const next = this.theme === 'dark' ? 'light' : 'dark'; this.setTheme(next); return next; }
  getTheme() { return this.theme; }
}

describe('WithdrawTokenComponent', () => {
  let component: WithdrawTokenComponent;
  let fixture: ComponentFixture<WithdrawTokenComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WithdrawTokenComponent, RouterTestingModule],
      providers: [
        { provide: ThemeService, useClass: MockThemeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WithdrawTokenComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── 1. Method Selection Rendering ───────────────────
  it('should render 4 method selection buttons', () => {
    const methodButtons = fixture.debugElement.queryAll(By.css('.btn-method-select'));
    expect(methodButtons.length).toBe(4);
  });

  it('should render Nequi method button', () => {
    const buttons = fixture.debugElement.queryAll(By.css('.btn-method-select'));
    const nequiButton = buttons.find(btn => btn.nativeElement.textContent.includes('Nequi'));
    expect(nequiButton).toBeTruthy();
  });

  it('should render DaviPlata method button', () => {
    const buttons = fixture.debugElement.queryAll(By.css('.btn-method-select'));
    const daviplataButton = buttons.find(btn => btn.nativeElement.textContent.includes('DaviPlata'));
    expect(daviplataButton).toBeTruthy();
  });

  it('should render USDT-TRC20 method button', () => {
    const buttons = fixture.debugElement.queryAll(By.css('.btn-method-select'));
    const trc20Button = buttons.find(btn => btn.nativeElement.textContent.includes('USDT-TRC20'));
    expect(trc20Button).toBeTruthy();
  });

  it('should render USDT-BEP20 method button', () => {
    const buttons = fixture.debugElement.queryAll(By.css('.btn-method-select'));
    const bep20Button = buttons.find(btn => btn.nativeElement.textContent.includes('USDT-BEP20'));
    expect(bep20Button).toBeTruthy();
  });

  // ─── 2. Method Navigation ────────────────────────────
  it('should navigate to /withdraw/nequi when Nequi is clicked', () => {
    const buttons = fixture.debugElement.queryAll(By.css('.btn-method-select'));
    const nequiButton = buttons.find(btn => btn.nativeElement.textContent.includes('Nequi'));
    nequiButton?.triggerEventHandler('click', null);
    expect(router.navigate).toHaveBeenCalledWith(['/withdraw', 'nequi']);
  });

  it('should navigate to /withdraw/daviplata when DaviPlata is clicked', () => {
    const buttons = fixture.debugElement.queryAll(By.css('.btn-method-select'));
    const daviplataButton = buttons.find(btn => btn.nativeElement.textContent.includes('DaviPlata'));
    daviplataButton?.triggerEventHandler('click', null);
    expect(router.navigate).toHaveBeenCalledWith(['/withdraw', 'daviplata']);
  });

  it('should navigate to /withdraw/usdt-trc20 when USDT-TRC20 is clicked', () => {
    const buttons = fixture.debugElement.queryAll(By.css('.btn-method-select'));
    const trc20Button = buttons.find(btn => btn.nativeElement.textContent.includes('USDT-TRC20'));
    trc20Button?.triggerEventHandler('click', null);
    expect(router.navigate).toHaveBeenCalledWith(['/withdraw', 'usdt-trc20']);
  });

  it('should navigate to /withdraw/usdt-bep20 when USDT-BEP20 is clicked', () => {
    const buttons = fixture.debugElement.queryAll(By.css('.btn-method-select'));
    const bep20Button = buttons.find(btn => btn.nativeElement.textContent.includes('USDT-BEP20'));
    bep20Button?.triggerEventHandler('click', null);
    expect(router.navigate).toHaveBeenCalledWith(['/withdraw', 'usdt-bep20']);
  });

  it('should call goToWithdraw with correct token parameter', () => {
    component.goToWithdraw('nequi');
    expect(router.navigate).toHaveBeenCalledWith(['/withdraw', 'nequi']);

    component.goToWithdraw('usdt-bep20');
    expect(router.navigate).toHaveBeenCalledWith(['/withdraw', 'usdt-bep20']);
  });

  // ─── 3. Template Content ─────────────────────────────
  it('should display menu title', () => {
    const title = fixture.debugElement.query(By.css('.menu-title'));
    expect(title).toBeTruthy();
    expect(title.nativeElement.textContent).toContain('Seleccione');
  });

  it('should render arrow icons on each method button', () => {
    const arrows = fixture.debugElement.queryAll(By.css('.arrow-icon'));
    expect(arrows.length).toBe(4);
  });

  it('should render method images', () => {
    const images = fixture.debugElement.queryAll(By.css('img'));
    expect(images.length).toBe(4);
  });
});
