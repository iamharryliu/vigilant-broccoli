import { Component, Input } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AppName, MessageRequest } from '@prettydamntired/personal-website-lib';
import { Subject, exhaustMap, tap } from 'rxjs';
import { CommonService } from '../services/common.service';
import { CommonModule } from '@angular/common';
import { LinkComponent } from '../link/link.component';
import { Link } from '../models';
import { LoadingButtonComponent } from '../loading-button/loading-button.component';

@Component({
  selector: 'lib-contact',
  templateUrl: './contact.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LinkComponent,
    LoadingButtonComponent,
  ],
})
export class ContactComponent {
  submit$ = new Subject<boolean>();
  @Input() LINKS: Link[] = [];
  @Input() APP_NAME!: AppName;
  @Input() headerText = 'Message Us!';
  loading = false;

  constructor(private commonService: CommonService) {
    this.submit$
      .pipe(
        tap(() => {
          this.loading = true;
        }),
        exhaustMap(() =>
          this.commonService.sendMessage({
            ...(this.form.value as MessageRequest),
            appName: this.APP_NAME,
          }),
        ),
      )
      .subscribe(_ => {
        this.loading = false;
        this.form.reset();
      });
  }

  form = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    message: new FormControl('', Validators.required),
  });

  submitForm() {
    this.submit$.next(true);
  }
}
