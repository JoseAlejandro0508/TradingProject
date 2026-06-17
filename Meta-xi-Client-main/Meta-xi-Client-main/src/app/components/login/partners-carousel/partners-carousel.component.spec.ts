import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartnersCarouselComponent } from './partners-carousel.component';

describe('PartnersCarouselComponent', () => {
  let component: PartnersCarouselComponent;
  let fixture: ComponentFixture<PartnersCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnersCarouselComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PartnersCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the carousel track', () => {
    const track = fixture.nativeElement.querySelector('.partners-carousel-track');
    expect(track).toBeTruthy();
  });

  it('should render 16 partner items (8 original + 8 duplicated)', () => {
    const items = fixture.nativeElement.querySelectorAll('.partner-logo-item');
    expect(items.length).toBe(16);
  });

  it('should have correct partner color classes', () => {
    const items = fixture.nativeElement.querySelectorAll('.partner-logo-item');
    const classes = Array.from(items).map((item: any) => item.className);
    expect(classes.some(c => c.includes('p-binance'))).toBe(true);
    expect(classes.some(c => c.includes('p-kucoin'))).toBe(true);
    expect(classes.some(c => c.includes('p-tradingview'))).toBe(true);
  });
});
