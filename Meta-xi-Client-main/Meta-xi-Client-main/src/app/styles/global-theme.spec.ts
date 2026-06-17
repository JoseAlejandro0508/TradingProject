import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

@Component({
  selector: 'app-test-global-theme',
  standalone: true,
  template: `
    <div id="global-test"
         class="bg-bg-main text-text-main border border-border-custom rounded-radius-lg shadow-shadow-glow p-spacing-md font-heading"></div>
  `
})
class TestGlobalThemeComponent {}

describe('Global theme styles from styles.scss', () => {
  let fixture: ComponentFixture<TestGlobalThemeComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestGlobalThemeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestGlobalThemeComponent);
    fixture.detectChanges();
    element = fixture.nativeElement.querySelector('#global-test');
  });

  it('should apply global bg color CSS variable via Tailwind class', () => {
    const style = getComputedStyle(element);
    expect(style.backgroundColor).toBe('rgb(12, 14, 16)');
  });

  it('should apply global text color CSS variable via Tailwind class', () => {
    const style = getComputedStyle(element);
    expect(style.color).toBe('rgb(255, 255, 255)');
  });

  it('should apply global border color CSS variable via Tailwind class', () => {
    const style = getComputedStyle(element);
    expect(style.borderColor).toBe('rgba(255, 255, 255, 0.08)');
  });

  it('should apply global font family from styles.scss', () => {
    const style = getComputedStyle(element);
    expect(style.fontFamily).toContain('Plus Jakarta Sans');
  });

  describe('light theme', () => {
    beforeEach(() => {
      document.body.setAttribute('data-theme', 'light');
    });

    afterEach(() => {
      document.body.removeAttribute('data-theme');
    });

    it('should apply light theme bg color when data-theme="light"', () => {
      const style = getComputedStyle(element);
      expect(style.backgroundColor).toBe('rgb(244, 246, 249)');
    });

    it('should apply light theme text color when data-theme="light"', () => {
      const style = getComputedStyle(element);
      expect(style.color).toBe('rgb(15, 17, 21)');
    });
  });
});
