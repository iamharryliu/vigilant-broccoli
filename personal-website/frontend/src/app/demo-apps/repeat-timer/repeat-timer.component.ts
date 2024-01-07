/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { CenteredAppLayoutComponent } from '@app/components/layouts/centered-app-layout/centered-app-layout.compoenent';

@Component({
  standalone: true,
  selector: 'app-repeat-timer',
  templateUrl: './repeat-timer.component.html',
  imports: [CommonModule, CenteredAppLayoutComponent],
})
export class RepeatTimerComponent implements OnDestroy {
  interval: number = 0;
  seconds: number = 0;
  minutes: number = 0;
  hours: number = 0;
  timeLeft: number = 0;
  private timer: any;
  isTimerRunning: boolean = false;
  minuteOptions = [1, 2, 5, 10, 15, 20, 30, 60];

  addMinutes(minutes: number) {
    this.interval += minutes * 60 * 1000;
    this.timeLeft = this.interval / 1000;
    this.onChange();
  }

  onChange() {
    this.hours = Math.floor(this.timeLeft / (60 * 60));
    this.minutes = Math.floor((this.timeLeft % (60 * 60)) / 60);
    this.seconds = Math.floor(this.timeLeft % 60);
  }

  startTimer() {
    this.isTimerRunning = true;
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.onChange();
      if (this.timeLeft === 0) {
        this.playSound();
        this.timeLeft = this.interval / 1000;
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timer);
    this.isTimerRunning = false;
  }

  playSound() {
    const audio = new Audio('assets/chime.mp3');
    audio.play();
  }

  ngOnDestroy() {
    this.stopTimer();
  }
}
