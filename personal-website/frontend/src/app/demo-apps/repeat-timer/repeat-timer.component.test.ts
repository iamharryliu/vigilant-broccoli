import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RepeatTimerComponent } from '@app/demo-apps/repeat-timer/repeat-timer.component';

describe('RepeatTimerComponent', () => {
  let component: RepeatTimerComponent;
  let fixture: ComponentFixture<RepeatTimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RepeatTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should start the timer', () => {
    component.startTimer();
    expect(component.isTimerRunning).toBe(true);
  });

  it('should stop the timer', () => {
    component.startTimer();
    expect(component.isTimerRunning).toBe(true);

    component.stopTimer();
    expect(component.isTimerRunning).toBe(false);
  });

  it('should set the timeLeft to interval when timer finishes', () => {
    component.interval = 5000; // Setting interval to 5 seconds (5000 milliseconds)
    component.startTimer();

    setTimeout(() => {
      expect(component.timeLeft).toBe(5); // After 5 seconds, timeLeft should be equal to the interval
    }, 6000); // Wait for 6 seconds to ensure the timer finishes
  });
});
