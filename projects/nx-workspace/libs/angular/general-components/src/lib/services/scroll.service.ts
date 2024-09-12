import { Injectable } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ScrollService {
  constructor(
    private viewportScroller: ViewportScroller,
    private route: ActivatedRoute,
  ) {}

  scrollToAnchor() {
    const anchor = this.route.snapshot.fragment;
    if (anchor) {
      setTimeout(() => {
        this.viewportScroller.scrollToAnchor(anchor);
      }, 0);
    }
  }
}
