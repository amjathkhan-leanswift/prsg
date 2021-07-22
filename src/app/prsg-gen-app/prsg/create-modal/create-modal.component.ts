import { Component, OnInit } from '@angular/core';
import {
   SohoDropDownComponent
} from 'ids-enterprise-ng';
import { IMIRequest } from '@infor-up/m3-odin';
import { MIService } from '@infor-up/m3-odin-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
   selector: 'app-create-modal',
   templateUrl: './create-modal.component.html',
   styleUrls: ['./create-modal.component.css']
})
export class CreateModalComponent implements OnInit {

   isInitData: boolean = false;
   public datePickerOptions: SohoDatePickerOptions = {
      mode: 'standard',
      dateFormat: 'yyyyMMdd'
   }
   listFaciData: any = [];
   listOrderData: any = [];
   listWareHouseData: any = [];

   constructor(
      private miService: MIService
   ) { }

   ngOnInit(): void {
      this.initialLoadData();
   }

   async initialLoadData() {
      this.setBusy('initialData', true);
      await this.initListFacility();
      await this.initLstOrderTypes();
      await this.initLstWarehouses();
      this.setBusy('initialData', false);
   }

   async initListFacility() {
      this.listFaciData = [];
      const request_faci: IMIRequest = {
         program: 'CRS008MI',
         transaction: 'ListFacility',
         outputFields: ['FACI', 'FACN']
      };

      await this.miService.execute(request_faci)
         .toPromise()
         .then((response: any) => {
            // console.log(response.items);
            this.listFaciData = response.items;
         })
         .catch(function (error) {
            console.log("List Facility Error", error.errorMessage);
         });
   }

   async initLstOrderTypes() {
      this.listOrderData = [];
      const request: IMIRequest = {
         program: 'OIS010MI',
         transaction: 'LstOrderTypes',
         outputFields: ['ORTP', 'TX40']
      };

      await this.miService.execute(request)
         .toPromise()
         .then((response: any) => {
            // console.log(response.items);
            this.listOrderData = response.items;
         })
         .catch(function (error) {
            console.log("List Order Data Error", error.errorMessage);
         });
   }

   async initLstWarehouses() {
      this.listWareHouseData = [];
      const request: IMIRequest = {
         program: 'MMS005MI',
         transaction: 'LstWarehouses',
         outputFields: ['WHLO', 'WHNM']
      };

      await this.miService.execute(request)
         .toPromise()
         .then((response: any) => {
            // console.log(response.items);
            this.listWareHouseData = response.items;
         })
         .catch(function (error) {
            console.log("List Order Data Error", error.errorMessage);
         });
   }

   private setBusy(isCall: string, isBusy: boolean) {
      if (isCall == "initialData") {
         this.isInitData = isBusy;
      }
   }

}
