/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CenteredAppLayoutComponent } from '@app/components/layouts/centered-app-layout/centered-app-layout.compoenent';

@Component({
  standalone: true,
  selector: 'app-repeat-timer',
  templateUrl: './repeat-timer.component.html',
  imports: [CommonModule, FormsModule, CenteredAppLayoutComponent],
})
export class RepeatTimerComponent implements OnDestroy {
  interval: number = 1000; // Default interval in milliseconds
  timeLeft: number = 0;
  private timer: any;
  isTimerRunning: boolean = false;

  startTimer() {
    this.timeLeft = this.interval / 1000;
    this.isTimerRunning = true;
    this.timer = setInterval(() => {
      this.timeLeft--;
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
