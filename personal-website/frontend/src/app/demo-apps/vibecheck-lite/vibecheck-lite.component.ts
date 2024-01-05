import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { CardComponent } from '@components/global/card/card.component';
import { LoadingSpinnerComponent } from '@components/global/loading-spinner/loading-spinner.component';
import { CenteredAppLayoutComponent } from '@layouts/centered-app-layout/centered-app-layout.compoenent';
import { VibecheckLiteService } from '@app/core/services/vibecheck-lite.service';
import { LocationService } from '@services/location.service';

interface VibecheckLiteResponse {
  status: boolean;
  data: string;
}

@Component({
  standalone: true,
  selector: 'app-vibecheck-lite',
  templateUrl: './vibecheck-lite.component.html',
  imports: [
    CommonModule,
    TranslateModule,
    CardComponent,
    LoadingSpinnerComponent,
    CenteredAppLayoutComponent,
  ],
  providers: [],
})
export class VibecheckLiteComponent {
  recommendation$!: Observable<VibecheckLiteResponse>;
  constructor(
    public vibecheckLiteService: VibecheckLiteService,
    private locationService: LocationService,
  ) {
    this.recommendation$ = this.locationService.getLocation().pipe(
      switchMap(res => {
        return vibecheckLiteService
          .getOutfitRecommendation(res)
          .pipe(map(res => res.data));
      }),
    );
  }
}
