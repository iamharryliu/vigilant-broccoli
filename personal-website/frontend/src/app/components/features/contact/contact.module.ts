import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ContactComponent } from '@features/contact/contact.component';
import { CommonService } from '@services/common.service';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';
import { ENVIRONMENT } from 'src/environments/environment';
import { LinkComponent } from '@app/components/global/link/link.component';

@NgModule({
  declarations: [ContactComponent],
  exports: [ContactComponent],
  providers: [
    CommonService,
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useValue: ENVIRONMENT.RECAPTCHA_V3_SITE_KEY,
    },
  ],
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    RecaptchaV3Module,
    LinkComponent,
  ],
})
export class ContactModule {}
