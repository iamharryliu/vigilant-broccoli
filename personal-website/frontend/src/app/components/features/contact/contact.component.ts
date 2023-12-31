import { Component } from '@angular/core';
import { CommonService } from '@services/common.service';
import { MessageRequest } from '@models/app.model';
import { Subject, exhaustMap } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LINKS } from '@consts/app-route.const';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LinkComponent } from '@components/global/link/link.component';

@Component({
  standalone: true,
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, LinkComponent],
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
