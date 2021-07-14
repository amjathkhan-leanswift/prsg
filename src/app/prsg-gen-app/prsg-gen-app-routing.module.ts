import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrsgGenAppComponent } from './prsg-gen-app.component';
import { PrsgComponent } from './prsg/prsg.component';

const routes: Routes = [
   {
      path: 'prsg', component: PrsgGenAppComponent, children: [
         { path: '', component: PrsgComponent }
      ]
   }
];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule]
})
export class PrsgGenAppRoutingModule { }
