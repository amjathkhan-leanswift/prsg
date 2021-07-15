import { Component, Input, OnInit } from '@angular/core';
import {
   SohoDropDownComponent
} from 'ids-enterprise-ng';
import { IMIRequest } from '@infor-up/m3-odin';
import { MIService } from '@infor-up/m3-odin-angular';

import { GlobalConstants } from '../../global-constants';

@Component({
   selector: 'app-chain-modal',
   templateUrl: './chain-modal.component.html',
   styleUrls: ['./chain-modal.component.css']
})
export class ChainModalComponent implements OnInit {

   @Input() businessChainData: any;
   isInitChainBusy: boolean = false;
   selectedChain: any;
   getChainsData: any = [];
   listChainsData: any = [];

   isErrorChain: boolean = false;

   constructor(
      private miService: MIService
   ) { }

   ngOnInit(): void {
      //this.selectedChain = "New";
      this.loadChainData();
   }
   async loadChainData() {
      this.setBusy('initialChainData', true);
      const inputRecord_chain = {
         CHAI: this.businessChainData
      };
      const request_chain: IMIRequest = {
         program: 'OIS040MI',
         transaction: 'GetBusChain',
         record: inputRecord_chain,
         outputFields: ['CHL1', 'CHL2', 'CHL3', 'CHL4']
      };

      await this.miService.execute(request_chain)
         .toPromise()
         .then((response: any) => {
            let getChains = response.items;
            this.getChainsData = [];
            if (getChains[0].CHL1 != '') {
               this.getChainsData.push(getChains[0].CHL1);
            }
            if (getChains[0].CHL2 != '') {
               this.getChainsData.push(getChains[0].CHL2);
            }
            if (getChains[0].CHL3 != '') {
               this.getChainsData.push(getChains[0].CHL3);
            }
            if (getChains[0].CHL4 != '') {
               this.getChainsData.push(getChains[0].CHL4);
            }
            //console.log(this.getChainsData);
            this.loadChainDataNames(this.getChainsData);
            GlobalConstants.chainConfirm = 0;
         })
         .catch(function (error) {
            GlobalConstants.chainConfirm = 1;
            console.log("Search Business Chain Error", error.errorMessage);
         });

      if (GlobalConstants.chainConfirm == 1) {
         this.isErrorChain = true;
         this.setBusy('initialChainData', false);
      }
   }

   async loadChainDataNames(chainDatas) {
      for (let i = 0; i < chainDatas.length; i++) {
         const inputRecord_chain_data = {
            CUNO: chainDatas[i]
         };
         const request_chain_data: IMIRequest = {
            program: 'CRS610MI',
            transaction: 'GetBasicData',
            record: inputRecord_chain_data,
            outputFields: ['CUNO', 'CUNM']
         };
         await this.miService.execute(request_chain_data)
            .toPromise()
            .then((response: any) => {
               let dataRes = response.items;
               this.listChainsData.push({ 'CUNO': dataRes[0].CUNO, 'CUNM': dataRes[0].CUNM });
            })
            .catch(function (error) {
               console.log("Business Chain Name Error", error.errorMessage);
            });
      }
      console.log(this.listChainsData);
      this.setBusy('initialChainData', false);

   }

   private setBusy(isCall: string, isBusy: boolean) {
      if (isCall == "initialChainData") {
         this.isInitChainBusy = isBusy;
      }
   }
}
