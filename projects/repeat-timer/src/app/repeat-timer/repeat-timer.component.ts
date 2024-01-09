import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy } from '@angular/core';

export const ALARM_INTERVAL = 3000;

@Component({
  standalone: true,
  selector: 'app-repeat-timer',
  templateUrl: './repeat-timer.component.html',
  imports: [CommonModule],
})
export class RepeatTimerComponent implements OnDestroy {
  interval: number = 0;
  seconds: number = 0;
  minutes: number = 0;
  hours: number = 0;
  timeLeft: number = 0;
  timer: any;
  alarm: any;
  isTimerRunning: boolean = false;
  minuteOptions = [1, 2, 5, 10, 15, 20, 30, 60];

  addMinutes(minutes: number) {
    this.interval += minutes * 60 * 1000;
    this.setTimeLeft();
  }

  setTimeLeft() {
    this.timeLeft = this.interval / 1000;
    this.udpdateCountdown();
  }

  udpdateCountdown() {
    this.hours = Math.floor(this.timeLeft / (60 * 60));
    this.minutes = Math.floor((this.timeLeft % (60 * 60)) / 60);
    this.seconds = Math.floor(this.timeLeft % 60);
  }

  startTimer() {
    this.isTimerRunning = true;
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.udpdateCountdown();
      if (this.timeLeft === 0) {
        this.startAlarm();
      }
    }, 1000);
  }

  startAlarm() {
    this.stopTimer();
    this.setTimeLeft();
    this.playSound();
    this.alarm = setInterval(() => {
      this.playSound();
    }, ALARM_INTERVAL);
  }

  stopTimer() {
    clearInterval(this.timer);
    this.isTimerRunning = false;
  }

  resetTimer() {
    this.stopTimer();
    this.interval = 0;
    this.setTimeLeft();
  }

  playSound() {
    const audio = new Audio('assets/chime.mp3');
    audio.play();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove() {
    clearInterval(this.alarm);
  }

  ngOnDestroy() {
    this.stopTimer();
  }
}
