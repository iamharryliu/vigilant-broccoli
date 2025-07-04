import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, exhaustMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LINKS } from '../../../../core/consts/routes.const';
import { VibecheckLiteService } from '../../../../core/services/vibecheck-lite.service';

@Component({
  selector: 'app-vibecheck-lite-subscribe-page',
  templateUrl: './vibecheck-lite-subscribe.page.html',
  imports: [ReactiveFormsModule, CommonModule],
})
export class VibecheckLiteSubscribePageComponent {
  constructor(
    private http: HttpClient,
    private vibecheckLiteService: VibecheckLiteService,
    private router: Router,
  ) {
    this.getCountries().subscribe(countries => {
      this.countries = countries;
    });
    this.getCities().subscribe(cities => {
      this.cities = cities;
    });
    this.submit$
      .pipe(
        exhaustMap(() => {
          const email = this.form.value.email as string;
          const [latitude, longitude] = (this.form.value.city as string)
            .split(',')
            .map(num => Number(num));
          return this.vibecheckLiteService.subscribeToVibecheckLite({
            email,
            latitude,
            longitude,
          });
        }),
      )
      .subscribe(_ => {
        this.router.navigateByUrl(LINKS.INDEX_PAGE.url.internal as string);
      });
  }

  submit$ = new Subject<boolean>();

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    city: new FormControl('', Validators.required),
  });

  countries!: { name: string; code: string }[];
  cities!: { country: string; name: string; lat: number; lng: number }[];
  citiesDropdown!: any[];

  public getCountries(): Observable<any> {
    return this.http.get('./assets/country-codes.json');
  }

  public getCities(): Observable<any> {
    return this.http.get('./assets/cities.json');
  }

  onCountryChange(e: any) {
    const COUNTRY_CODE = e.target.value;
    this.citiesDropdown = this.cities.filter(
      city => city.country === COUNTRY_CODE,
    );
  }
  onSubmit() {
    this.submit$.next(true);
  }
}
