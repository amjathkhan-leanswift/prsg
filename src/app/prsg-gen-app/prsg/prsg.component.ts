import {
   Component,
   OnInit,
   AfterViewInit,
   QueryList,
   ViewChildren,
   ViewContainerRef,
   ViewChild,
   ElementRef
} from '@angular/core';
import { CoreBase, IMIRequest, IMIResponse, IUserContext } from '@infor-up/m3-odin';
import { MIService, UserService } from '@infor-up/m3-odin-angular';
import {
   SohoDataGridComponent,
   SohoToastService,
   SohoDropDownComponent,
   SohoMessageService,
   SohoMessageRef,
   SohoAutoCompleteComponent,
   SohoModalDialogService, SohoModalDialogRef
} from 'ids-enterprise-ng';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { SohoInputValidateDirective } from 'ids-enterprise-ng';
import { DecimalPipe } from '@angular/common';
import { forkJoin } from 'rxjs';

import { ChainModalComponent } from './chain-modal/chain-modal.component'

@Component({
   selector: 'app-prsg',
   templateUrl: './prsg.component.html',
   styleUrls: ['./prsg.component.css']
})
export class PrsgComponent extends CoreBase implements OnInit {

   @ViewChild('dialogPlaceholder', { read: ViewContainerRef, static: true })
   placeholder?: ViewContainerRef;

   isInitItemBusy: boolean = false;
   @ViewChild('customerLineDatagrid') customerLineDatagrid: SohoDataGridComponent;
   customerGridOptions: SohoDataGridOptions;

   pageSize = 10;
   businessChainText: any;
   customerData: any = [];
   isCustItemBusy: boolean = false;

   constructor(
      private miService: MIService,
      private toastService: SohoToastService,
      private messageService: SohoMessageService,
      private modalDialog: SohoModalDialogService
   ) {
      super('PrsgComponent');
   }

   ngOnInit(): void {
      this.initData();
      this.initCustomerLineGrid();

   }

   onTabActivated(event: any) {
      console.log(event.tab + ' TabsBasicDemoComponent.onTabActivated');
   }

   initCustomerLineGrid() {
      const customerOptions: SohoDataGridOptions = {
         selectable: 'multiple' as SohoDataGridSelectable,
         disableRowDeactivation: false,
         clickToSelect: false,
         alternateRowShading: false,
         cellNavigation: true,
         idProperty: 'col-cuno',
         paging: true,
         pagesize: this.pageSize,
         indeterminate: false,
         filterable: true,
         stickyHeader: false,
         hidePagerOnOnePage: true,
         rowHeight: 'small',
         editable: true,
         columns: [
            {
               width: '5%', id: 'selectionCheckbox', sortable: false,
               resizable: false, align: 'center', formatter: Soho.Formatters.SelectionCheckbox
            },
            {
               width: '15%', id: 'col-cuno', field: 'CUNO', name: 'Customer',
               resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
            },
            {
               width: '30%', id: 'col-cunm', field: 'CUNM', name: 'Name',
               resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
            },
            {
               width: '20%', id: 'col-cua1', field: 'CUA1', name: 'Address 1',
               resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
            },
            {
               width: '20%', id: 'col-cua2', field: 'CUA2', name: 'Address 2',
               resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
            },
            {
               width: '10%', id: 'col-town', field: 'TOWN', name: 'City',
               resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
            }
         ],
         dataset: [],
         toolbar: { title: 'Customer List', actions: true, results: true, personalize: true, exportToExcel: true },
         emptyMessage: {
            title: 'Empty Customer List',
            icon: 'icon-empty-no-data'
         }
      };
      this.customerGridOptions = customerOptions;
   }

   initData() {
      this.setBusy('initialData', true);
      this.setBusy('initialData', false);
   }

   searchBusinessChain() {
      if (this.businessChainText != '' && this.businessChainText != null) {
         const dialog = this.modalDialog.modal(ChainModalComponent);
         let dialogComponent: ChainModalComponent;

         dialog.buttons([
            {
               text: 'Cancel',
               click: () => dialog.close()
            },
            {
               text: 'Apply',
               isDefault: true,
               click: () => dialog.close(true)
            }
         ])

            .title(`${this.businessChainText} - Business Chain List`)
            .apply((comp: ChainModalComponent) => {
               comp.businessChainData = this.businessChainText;
               dialogComponent = comp;
            })
            .open()
            .afterClose((result) => {
               if (result) {
                  //console.log(dialogComponent.selectedChain);
                  this.LstBusChainCust(dialogComponent.selectedChain)
               }
            });
      } else {
         this.showToast('Business Chain Error', 'No Input Data');
      }

   }

   async LstBusChainCust(data: any) {
      this.setBusy('custData', true);
      const inputRecord_chain = {
         CHCT: data,
         NFTR: '1'
      };
      const request_chain: IMIRequest = {
         program: 'OIS040MI',
         transaction: 'LstBusChainCust',
         record: inputRecord_chain,
         outputFields: ['CUNO']
      };
      await this.miService.execute(request_chain)
         .toPromise()
         .then((response: any) => {
            let getCust = response.items;
            console.log(getCust);
            this.getCustomerData(getCust);
         })
         .catch(function (error) {
            console.log("List Business Chain Customer Error", error.errorMessage);
         });

   }

   async getCustomerData(data: any) {
      this.customerData = [];
      for (let i = 0; i < data.length; i++) {
         const inputRecord_chain = {
            CUNO: data[i].CUNO
         };
         const request_chain: IMIRequest = {
            program: 'CRS610MI',
            transaction: 'GetBasicData',
            record: inputRecord_chain,
            outputFields: ['CUNO', 'CUNM', 'CUA1', 'CUA2', 'TOWN']
         };
         await this.miService.execute(request_chain)
            .toPromise()
            .then((response: any) => {
               let getCustData = response.items;
               this.customerData.push({ 'CUNO': getCustData[0].CUNO, 'CUNM': getCustData[0].CUNM, 'CUA1': getCustData[0].CUA1, 'CUA2': getCustData[0].CUA2, 'TOWN': getCustData[0].TOWN });
            })
            .catch(function (error) {
               console.log("Customer Data Error", error.errorMessage);
            });
      }
      console.log(this.customerData);
      this.updateCustomerList();
      this.setBusy('custData', false);
   }

   updateCustomerList() {
      this.customerLineDatagrid ? this.customerLineDatagrid.dataset = this.customerData : this.customerLineDatagrid.dataset = this.customerData;
   }

   private setBusy(isCall: string, isBusy: boolean) {
      if (isCall == "initialData") {
         this.isInitItemBusy = isBusy;
      } else if (isCall == "custData") {
         this.isCustItemBusy = isBusy;
      }
   }

   showToast(title: any, message: any) {
      this.toastService.show({ draggable: true, title: title, message: message });
   }

}
