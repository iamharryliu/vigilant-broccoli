import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ContactComponent } from '@components/contact/contact.component';
import { CommonService } from '@services/common.service';

@NgModule({
  declarations: [ContactComponent],
  exports: [ContactComponent],
  providers: [CommonService],
  imports: [CommonModule, TranslateModule, FormsModule],
})
export class ContactModule {}
