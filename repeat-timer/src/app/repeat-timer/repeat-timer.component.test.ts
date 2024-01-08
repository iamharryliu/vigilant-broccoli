import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RepeatTimerComponent } from './repeat-timer.component';

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
    jest.useFakeTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start the timer', () => {
    const udpdateCountdownSpy = jest.spyOn(component, 'udpdateCountdown');
    component.addMinutes(5);
    component.startTimer();
    expect(component.isTimerRunning).toBe(true);
    expect(component.timer).toBeDefined();
    expect(udpdateCountdownSpy).toHaveBeenCalled();
  });

  it('should stop the timer', () => {
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
    component.stopTimer();
    expect(clearIntervalSpy).toHaveBeenCalledWith(component.timer);
    expect(component.isTimerRunning).toBe(false);
  });

  it('should reset the timer', () => {
    jest.spyOn(component, 'stopTimer');
    jest.spyOn(component, 'setTimeleft');
    jest.spyOn(component, 'udpdateCountdown');
    component.addMinutes(10);
    component.resetTimer();
    expect(component.stopTimer).toHaveBeenCalled();
    expect(component.interval).toBe(0);
    expect(component.setTimeleft).toHaveBeenCalled();
    expect(component.udpdateCountdown).toHaveBeenCalled();
  });

  it('should play sound when timer reaches 0', () => {
    jest.spyOn(component, 'playSound');
    component.interval = 5000;
    component.setTimeleft();
    component.startTimer();
    jest.advanceTimersByTime(5000);
    expect(component.playSound).toHaveBeenCalled();
  });
});
