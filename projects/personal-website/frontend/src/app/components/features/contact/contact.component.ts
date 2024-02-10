import { Component } from '@angular/core';
import { CommonService } from '@services/common.service';
import { Subject, exhaustMap } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LINKS } from '@consts/app-route.const';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { LinkComponent } from '@app/components/global/link/link.component';
import { MessageRequest } from '@prettydamntired/personal-website-lib';

@Component({
  standalone: true,
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  imports: [CommonModule, ReactiveFormsModule, LinkComponent],
})
export class ContactComponent {
  submit$: Subject<boolean> = new Subject();

  constructor(private commonService: CommonService) {
    this.submit$
      .pipe(
        exhaustMap(() =>
          this.commonService.sendMessage({
            ...(this.form.value as MessageRequest),
          }),
        ),
      )
      .subscribe(_ => {
        this.form.reset();
      });
  }

  form = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    message: new FormControl('', Validators.required),
  });

  LINKS = [
    LINKS.LINKEDIN,
    LINKS.PERSONAL_INSTAGRAM,
    LINKS.SECONDHAND_STORE_IG,
    LINKS.SKATE_IG,
  ];

  submitForm() {
    this.submit$.next(true);
  }
}
