import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ThemeService]
    });
    service = TestBed.inject(ThemeService);
    localStorage.clear();
    document.body.removeAttribute('data-theme');
  });

  afterEach(() => {
    localStorage.clear();
    document.body.removeAttribute('data-theme');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set data-theme="dark" on body and persist to localStorage when setTheme("dark") is called', () => {
    service.setTheme('dark');
    expect(document.body.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('should set data-theme="light" on body and persist to localStorage when setTheme("light") is called', () => {
    service.setTheme('light');
    expect(document.body.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('should initialize theme from localStorage if a saved preference exists', () => {
    localStorage.setItem('theme', 'light');
    const newService = new ThemeService();
    expect(document.body.getAttribute('data-theme')).toBe('light');
  });

  it('should default to dark theme when no localStorage preference exists', () => {
    const newService = new ThemeService();
    expect(document.body.getAttribute('data-theme')).toBe('dark');
  });

  it('should toggle theme from dark to light', () => {
    service.setTheme('dark');
    const result = service.toggleTheme();
    expect(result).toBe('light');
    expect(document.body.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('should toggle theme from light to dark', () => {
    service.setTheme('light');
    const result = service.toggleTheme();
    expect(result).toBe('dark');
    expect(document.body.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});
