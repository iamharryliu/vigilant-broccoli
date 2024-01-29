import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '@app/components/global/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './admin.component.html',
})
export class AdminComponent implements OnInit {
  constructor(private http: HttpClient) {}

  data: any;

  ngOnInit(): void {
    this.http
      .get<any>('https://app-monitor-api.fly.dev/')
      .subscribe(
        res =>
          (this.data = {
            status: Object.values(res.data).every(value => value === true),
            data: res.data,
          }),
      );
  }
}
