import { Component, OnInit } from '@angular/core';

@Component({
  template: '',
})
export class ResumeRedirectComponent implements OnInit {
  ngOnInit(): void {
    const pdfUrl =
      'https://pub-58ce4471f12945b18c85facfbd56367e.r2.dev/HarryLiu-Resume.pdf';
    window.location.href = pdfUrl;
  }
}
