/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { CenteredAppLayoutComponent } from '@app/components/layouts/centered-app-layout/centered-app-layout.compoenent';

@Component({
  selector: 'app-repeat-timer',
  standalone: true,
  templateUrl: './repeat-timer.component.html',
  imports: [CenteredAppLayoutComponent],
})
export class RepeatTimerComponent {
  playSoundAtIntervals() {
    this.playSound();
    const timedIntervalInMinutes = 20;
    const now = new Date();
    const minutesUntilNextInterval =
      timedIntervalInMinutes - (now.getMinutes() % timedIntervalInMinutes);
    const initialDelayInMilliseconds = minutesUntilNextInterval * 60 * 1000;

    setTimeout(() => {
      setInterval(
        () => {
          this.playSound();
        },
        timedIntervalInMinutes * 60 * 1000,
      );
    }, initialDelayInMilliseconds);
  }

  playSound() {
    const audio = new Audio('assets/chime.mp3');
    audio.play();
  }
}
