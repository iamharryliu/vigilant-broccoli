import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  isBrowser = false;
  isMobile = false;

  init() {}

  setIsMobile() {
    this.isBrowser = false;
    this.isMobile = true;
  }

  setIsBrowser() {
    this.isBrowser = true;
    this.isMobile = false;
  }
}
