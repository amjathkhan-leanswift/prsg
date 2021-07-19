import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { M3OdinModule } from '@infor-up/m3-odin-angular';
import { SohoComponentsModule, SohoDropDownComponent } from 'ids-enterprise-ng';

import { PrsgGenAppRoutingModule } from './prsg-gen-app-routing.module';
import { PrsgGenAppComponent } from './prsg-gen-app.component';
import { PrsgComponent } from './prsg/prsg.component';
import { ChainModalComponent } from './prsg/chain-modal/chain-modal.component';
import { CreateModalComponent } from './prsg/create-modal/create-modal.component';


@NgModule({
   declarations: [
      PrsgGenAppComponent,
      PrsgComponent,
      ChainModalComponent,
      CreateModalComponent
   ],
   imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      M3OdinModule,
      SohoComponentsModule,
      PrsgGenAppRoutingModule
   ]
})
export class PrsgGenAppModule { }
