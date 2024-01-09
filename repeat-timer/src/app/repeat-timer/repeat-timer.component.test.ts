import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ALARM_INTERVAL, RepeatTimerComponent } from './repeat-timer.component';

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

  describe('addMinutes', () => {
    it('should set internal and call setTimeLeft', () => {
      jest.spyOn(component, 'setTimeLeft');
      const minutes = 5;
      component.addMinutes(minutes);
      expect(component.interval).toEqual(minutes * 60 * 1000);
      expect(component.setTimeLeft).toHaveBeenCalled();
    });
  });

  describe('startTimer', () => {
    it('should set timer to running to true', () => {
      component.startTimer();
      expect(component.isTimerRunning).toEqual(true);
    });

    it('should start the timer and call updateCountdown every second', () => {
      jest.spyOn(component, 'udpdateCountdown');
      component.startTimer();
      expect(component.timer).toBeDefined();
      jest.advanceTimersByTime(1000);
      expect(component.udpdateCountdown).toHaveBeenCalled();
    });

    it('should startAlarm when timer reaches 0', () => {
      const testInterval = 5000;
      jest.spyOn(component, 'startAlarm');
      component.interval = testInterval;
      component.setTimeLeft();
      component.startTimer();
      jest.advanceTimersByTime(testInterval);
      expect(component.startAlarm).toHaveBeenCalled();
    });
  });

  describe('startAlarm', () => {
    it('should call stop timer and setTimeLeft', () => {
      jest.spyOn(component, 'stopTimer');
      jest.spyOn(component, 'startTimer');
      component.startAlarm();
    });

    it('should set an alarm and play sound every 3 seconds', () => {
      jest.spyOn(component, 'playSound');
      component.startAlarm();
      expect(component.playSound).toHaveBeenCalled();
      jest.advanceTimersByTime(ALARM_INTERVAL);
      expect(component.playSound).toHaveBeenCalledTimes(2);
    });
  });

  describe('stopTimer', () => {
    it('should clear the timer and set isTimerRunning to false', () => {
      jest.spyOn(window, 'clearInterval');
      component.stopTimer();
      expect(window.clearInterval).toHaveBeenCalledWith(component.timer);
      expect(component.isTimerRunning).toBe(false);
    });
  });

  describe('resetTimer', () => {
    it('should reset the timer', () => {
      jest.spyOn(component, 'stopTimer');
      jest.spyOn(component, 'setTimeLeft');
      component.resetTimer();
      expect(component.stopTimer).toHaveBeenCalled();
      expect(component.interval).toBe(0);
      expect(component.setTimeLeft).toHaveBeenCalled();
    });
  });

  describe('onMouseMove', () => {
    it('should clear the alarm when mousemove event occurs', () => {
      jest.spyOn(window, 'clearInterval');
      component.onMouseMove();
      expect(window.clearInterval).toHaveBeenCalledWith(component.alarm);
    });
  });
});
