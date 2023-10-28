import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { map, switchMap } from 'rxjs';
import { CommonService } from '@services/common.service';
import { LocationService } from '@services/location.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-vibecheck-lite',
  templateUrl: './vibecheck-lite.component.html',
  imports: [CommonModule, TranslateModule],
  providers: [LocationService],
})
export class VibecheckLiteComponent {
  recommendation$!: any;
  constructor(
    public commonService: CommonService,
    private locationService: LocationService,
  ) {
    this.recommendation$ = this.locationService.getLocation().pipe(
      switchMap(res => {
        return commonService
          .getOutfitRecommendation(res)
          .pipe(map(res => res.data));
      }),
    );
  }
}
