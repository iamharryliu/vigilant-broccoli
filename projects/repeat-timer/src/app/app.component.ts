import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { RepeatTimerComponent } from './repeat-timer/repeat-timer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RepeatTimerComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'repeat-timer';
}
