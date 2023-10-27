import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CommonService } from '@app/core/services/common.service';
import { map } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-vibecheck-lite',
  templateUrl: './vibecheck-lite.component.html',
  imports: [CommonModule],
})
export class VibeCheckLiteComponent {
  test!: any;
  constructor(public commonService: CommonService) {
    this.test = commonService
      .getOutfitRecommendation()
      .pipe(map(res => res.data));
  }
}
