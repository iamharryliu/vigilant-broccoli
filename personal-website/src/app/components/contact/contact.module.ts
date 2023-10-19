import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ContactComponent } from '@components/contact/contact.component';
import { CommonService } from '@services/common.service';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';
import { ENVIRONMENT } from 'src/environment/environment';

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
  imports: [CommonModule, TranslateModule, FormsModule, RecaptchaV3Module],
})
export class ContactModule {}
