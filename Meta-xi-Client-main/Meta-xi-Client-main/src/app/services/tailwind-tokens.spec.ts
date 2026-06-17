import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

@Component({
  selector: 'app-test-tailwind',
  standalone: true,
  template: `
    <div id="test-tokens" style="--bg-main: #0c0e10; --text-main: #ffffff; --border: rgba(255,255,255,0.08); --accent: #2962ff;"
         class="bg-bg-main text-text-main border border-border-custom rounded-radius-lg shadow-shadow-glow p-spacing-md font-heading"></div>
  `
})
class TestTailwindComponent {}

describe('Tailwind custom tokens', () => {
  let fixture: ComponentFixture<TestTailwindComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestTailwindComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestTailwindComponent);
    fixture.detectChanges();
    element = fixture.nativeElement.querySelector('#test-tokens');
  });

  it('should apply custom bg color token using CSS variable', () => {
    const style = getComputedStyle(element);
    expect(style.backgroundColor).toBe('rgb(12, 14, 16)');
  });

  it('should apply custom text color token using CSS variable', () => {
    const style = getComputedStyle(element);
    expect(style.color).toBe('rgb(255, 255, 255)');
  });

  it('should apply custom border color token using CSS variable', () => {
    const style = getComputedStyle(element);
    expect(style.borderColor).toBe('rgba(255, 255, 255, 0.08)');
  });

  it('should apply custom border radius token', () => {
    const style = getComputedStyle(element);
    expect(style.borderTopLeftRadius).toBe('16px');
  });

  it('should apply custom shadow token', () => {
    const style = getComputedStyle(element);
    expect(style.boxShadow).toContain('rgba(41, 98, 255');
  });

  it('should apply custom spacing token', () => {
    const style = getComputedStyle(element);
    expect(style.paddingTop).toBe('16px');
  });

  it('should apply custom font family token', () => {
    const style = getComputedStyle(element);
    expect(style.fontFamily).toContain('Plus Jakarta Sans');
  });
});
