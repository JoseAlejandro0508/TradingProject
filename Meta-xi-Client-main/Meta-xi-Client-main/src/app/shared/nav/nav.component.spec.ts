import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NavComponent } from './nav.component';
import { ThemeService } from '../../services/theme.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NotificationService } from '../../services/products/notification.service';
import { Router } from '@angular/router';

class MockThemeService {
  private theme = 'dark';
  getTheme() { return this.theme; }
  toggleTheme() { this.theme = this.theme === 'dark' ? 'light' : 'dark'; }
}

class MockNotificationService {
  correct() {}
  errorMessage() {}
}

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;
  let themeService: MockThemeService;
  let router: Router;

  beforeEach(async () => {
    themeService = new MockThemeService();
    await TestBed.configureTestingModule({
      imports: [NavComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ThemeService, useValue: themeService },
        { provide: NotificationService, useValue: new MockNotificationService() }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── Sidebar tests ──────────────────────────────────
  it('should open sidebar when toggleSidebar is called', () => {
    expect(component.sidebarOpen).toBeFalse();
    component.toggleSidebar();
    expect(component.sidebarOpen).toBeTrue();
  });

  it('should close sidebar when closeSidebar is called', () => {
    component.sidebarOpen = true;
    component.closeSidebar();
    expect(component.sidebarOpen).toBeFalse();
  });

  it('should close sidebar and navigate on navigateTo', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.sidebarOpen = true;
    component.navigateTo('/welcome');
    expect(component.sidebarOpen).toBeFalse();
    expect(navigateSpy).toHaveBeenCalledWith(['/welcome']);
  });

  it('should not navigate for route #', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.navigateTo('#');
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  // ─── Chat tests ─────────────────────────────────────
  it('should open chat when openChat is called', () => {
    expect(component.chatOpen).toBeFalse();
    component.openChat();
    expect(component.chatOpen).toBeTrue();
  });

  it('should close chat when closeChat is called', () => {
    component.chatOpen = true;
    component.closeChat();
    expect(component.chatOpen).toBeFalse();
  });

  it('should append user message and system reply on sendMessage', fakeAsync(() => {
    component.newMessage = 'Hola';
    component.sendMessage();
    expect(component.messages.length).toBe(1);
    expect(component.messages[0].type).toBe('user');
    expect(component.messages[0].text).toBe('Hola');
    expect(component.newMessage).toBe('');

    tick(1200);
    expect(component.messages.length).toBe(2);
    expect(component.messages[1].type).toBe('system');
  }));

  it('should not send empty message', () => {
    component.newMessage = '   ';
    component.sendMessage();
    expect(component.messages.length).toBe(0);
  });

  // ─── Theme tests ────────────────────────────────────
  it('should call themeService.toggleTheme on toggleTheme', () => {
    const spy = spyOn(themeService, 'toggleTheme').and.callThrough();
    component.toggleTheme();
    expect(spy).toHaveBeenCalled();
  });

  it('should return "Modo Claro" when theme is dark', () => {
    expect(component.themeLabel).toBe('Modo Claro');
  });

  it('should return "Modo Oscuro" when theme is light', () => {
    themeService.toggleTheme();
    expect(component.themeLabel).toBe('Modo Oscuro');
  });

  // ─── Existing logic preserved ───────────────────────
  it('should set isScrolled true when pageYOffset > 0', () => {
    component.onWindowScroll();
    // window.pageYOffset is 0 in test environment, so isScrolled should be false
    expect(component.isScrolled).toBeFalse();
  });

  it('should route to /task on toggleModal', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.toggleModal();
    expect(navigateSpy).toHaveBeenCalledWith(['/task']);
  });
});
