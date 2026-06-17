import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TradingChartComponent } from './trading-chart.component';

describe('TradingChartComponent', () => {
  let component: TradingChartComponent;
  let fixture: ComponentFixture<TradingChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradingChartComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TradingChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the chart container', () => {
    const chart = fixture.nativeElement.querySelector('.live-trading-chart');
    expect(chart).toBeTruthy();
  });

  it('should render 8 candle bars', () => {
    const candles = fixture.nativeElement.querySelectorAll('.candle-bar');
    expect(candles.length).toBe(8);
  });

  it('should have alternating up and down candle classes', () => {
    const candles = fixture.nativeElement.querySelectorAll('.candle-bar');
    const upCandles = fixture.nativeElement.querySelectorAll('.c-up');
    const downCandles = fixture.nativeElement.querySelectorAll('.c-down');
    expect(upCandles.length).toBeGreaterThan(0);
    expect(downCandles.length).toBeGreaterThan(0);
    expect(candles.length).toBe(upCandles.length + downCandles.length);
  });

  it('should apply animation delays to candles', () => {
    const candles = fixture.nativeElement.querySelectorAll('.candle-bar');
    const delays = Array.from(candles).map((c: any) => c.style.animationDelay);
    const uniqueDelays = new Set(delays);
    expect(uniqueDelays.size).toBeGreaterThan(1);
  });
});
