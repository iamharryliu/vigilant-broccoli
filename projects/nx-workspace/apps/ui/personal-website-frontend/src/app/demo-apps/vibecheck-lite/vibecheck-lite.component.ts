import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { CardComponent } from '../../components/global/card/card.component';
import { LoadingSpinnerComponent } from '../../components/global/loading-spinner/loading-spinner.component';
import { CenteredAppLayoutComponent } from '../../components/layouts/centered-app-layout/centered-app-layout.compoenent';
import { VibecheckLiteService } from '../../core/services/vibecheck-lite.service';
import { LocationService } from '@vigilant-broccoli/common-browser';

interface VibecheckLiteResponse {
  status: boolean;
  data: string;
}

@Component({
  selector: 'app-vibecheck-lite',
  templateUrl: './vibecheck-lite.component.html',
  imports: [
    CommonModule,
    CardComponent,
    LoadingSpinnerComponent,
    CenteredAppLayoutComponent,
  ],
  providers: [LocationService],
})
export class VibecheckLiteComponent {
  recommendation$!: Observable<VibecheckLiteResponse>;

  public vibecheckLiteService = inject(VibecheckLiteService);
  private locationService = inject(LocationService);
  
  constructor() {
    this.recommendation$ = this.locationService.getLocation().pipe(
      switchMap(res => {
        return this.vibecheckLiteService
          .getOutfitRecommendation(res)
          .pipe(map(res => res.data));
      }),
    );
  }
}
