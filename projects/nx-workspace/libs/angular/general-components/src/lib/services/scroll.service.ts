import { inject, Injectable } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ScrollService {

    private viewportScroller = inject(ViewportScroller)
    private route = inject(ActivatedRoute)

  scrollToAnchor() {
    const anchor = this.route.snapshot.fragment;
    if (anchor) {
      setTimeout(() => {
        this.viewportScroller.scrollToAnchor(anchor);
      }, 0);
    }
  }
}
