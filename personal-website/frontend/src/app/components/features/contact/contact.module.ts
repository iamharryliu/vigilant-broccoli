import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ContactComponent } from '@features/contact/contact.component';
import { CommonService } from '@services/common.service';
import { LinkComponent } from '@app/components/global/link/link.component';

@NgModule({
  declarations: [ContactComponent],
  exports: [ContactComponent],
  providers: [CommonService],
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, LinkComponent],
})
export class ContactModule {}
