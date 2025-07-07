import { Component, OnInit } from '@angular/core';

@Component({
  template: '',
})
export class ResumeRedirectComponent implements OnInit {
  ngOnInit(): void {
    const pdfUrl = 'https://bucket.harryliu.dev/HarryLiu-Resume.pdf';
    window.location.href = pdfUrl;
  }
}
