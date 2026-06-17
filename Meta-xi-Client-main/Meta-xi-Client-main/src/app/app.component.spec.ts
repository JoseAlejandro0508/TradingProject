import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { BackgroundComponent } from './common/background/background.component';
import { Component } from '@angular/core';

// Mock BackgroundComponent to avoid importing its dependencies
@Component({
  selector: 'app-background',
  standalone: true,
  template: '<div>Mock Background</div>',
})
class MockBackgroundComponent {}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    })
      .overrideComponent(AppComponent, {
        remove: { imports: [BackgroundComponent] },
        add: { imports: [MockBackgroundComponent] },
      })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render app-background component in template', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-background')).toBeTruthy();
  });
});
