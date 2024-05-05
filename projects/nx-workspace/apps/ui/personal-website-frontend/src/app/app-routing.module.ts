import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ROUTES } from './core/consts/routes.const';

@NgModule({
  imports: [RouterModule.forRoot(ROUTES)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
