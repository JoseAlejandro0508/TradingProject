import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { ButtonsComponent } from './buttons.component';

describe('ButtonsComponent', () => {
  let component: ButtonsComponent;
  let fixture: ComponentFixture<ButtonsComponent>;
  let routerEvents: Subject<any>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerEvents = new Subject<any>();

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    (mockRouter as any).url = '/home';
    (mockRouter as any).events = routerEvents.asObservable();

    await TestBed.configureTestingModule({
      imports: [ButtonsComponent],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with activeIndex 0 for /home', () => {
    expect(component.activeIndex).toBe(0);
    expect(component.indicatorTransform).toBe('translateX(0px)');
  });

  it('should update activeIndex to 2 on /me route', fakeAsync(() => {
    routerEvents.next(new NavigationEnd(1, '/me', '/me'));
    tick();
    fixture.detectChanges();
    expect(component.activeIndex).toBe(2);
    expect(component.indicatorTransform).toBe('translateX(176px)');
  }));

  it('should set isLogined on /login route', fakeAsync(() => {
    routerEvents.next(new NavigationEnd(1, '/login', '/login'));
    tick();
    fixture.detectChanges();
    expect(component.isLogined).toBeTrue();
  }));

  it('should return correct isActive value', () => {
    component.currentUrl = '/home';
    expect(component.isActive('/home')).toBeTrue();
    expect(component.isActive('/me')).toBeFalse();
  });

  it('should navigate on item click', () => {
    const fakeEvent = { currentTarget: document.createElement('a') } as unknown as Event;
    component.onItemClick(fakeEvent, 1, '/home');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    expect(component.activeIndex).toBe(1);
    expect(component.indicatorTransform).toBe('translateX(88px)');
  });

  it('should not navigate for Perfil (#)', () => {
    const fakeEvent = { currentTarget: document.createElement('a') } as unknown as Event;
    component.onItemClick(fakeEvent, 3, '#');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(component.activeIndex).toBe(3);
  });

  it('should create ripple element', () => {
    const element = document.createElement('a');
    element.style.width = '80px';
    element.style.height = '68px';
    component.createRipple(element);
    const ripple = element.querySelector('.ripple');
    expect(ripple).toBeTruthy();
    expect(ripple?.tagName.toLowerCase()).toBe('span');
  });

  it('should remove old ripple before creating new one', () => {
    const element = document.createElement('a');
    element.style.width = '80px';
    element.style.height = '68px';
    component.createRipple(element);
    component.createRipple(element);
    expect(element.querySelectorAll('.ripple').length).toBe(1);
  });
});
