import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeToggleComponent } from './theme-toggle.component';
import { ThemeService } from '../../../services/theme.service';

class MockThemeService {
  private theme = 'dark';
  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    return this.theme;
  }
  getTheme() {
    return this.theme;
  }
}

describe('ThemeToggleComponent', () => {
  let component: ThemeToggleComponent;
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let themeService: MockThemeService;

  beforeEach(async () => {
    themeService = new MockThemeService();
    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
      providers: [{ provide: ThemeService, useValue: themeService }]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a checkbox input', () => {
    const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeTruthy();
  });

  it('should call toggleTheme on checkbox change', () => {
    const spy = spyOn(themeService, 'toggleTheme').and.callThrough();
    const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]');
    checkbox.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should reflect dark theme as checked by default', () => {
    const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]');
    expect(checkbox.checked).toBe(true);
  });

  it('should reflect light theme as unchecked', () => {
    themeService.toggleTheme();
    fixture.detectChanges();
    const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]');
    expect(checkbox.checked).toBe(false);
  });
});
