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
   SohoModalDialogService, SohoModalDialogRef,
   SohoFileUploadComponent, SohoTrackDirtyDirective
} from 'ids-enterprise-ng';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { SohoInputValidateDirective } from 'ids-enterprise-ng';
import { DecimalPipe } from '@angular/common';
import { forkJoin } from 'rxjs';

import { ChainModalComponent } from './chain-modal/chain-modal.component'
import { CreateModalComponent } from './create-modal/create-modal.component';

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
   isCustItemBusy: boolean = false;

   @ViewChild('itemLineDatagrid') itemLineDatagrid: SohoDataGridComponent;
   itemGridOptions: SohoDataGridOptions;
   isItemBusy: boolean = false;

   @ViewChild('matrixLineDatagrid', { static: false }) matrixLineDatagrid?: SohoDataGridComponent;
   matrixGridOptions: SohoDataGridOptions;
   isMatrixBusy: boolean = false;

   @ViewChild('itemExcelLineDatagrid') itemExcelLineDatagrid: SohoDataGridComponent;
   itemExcelGridOptions: SohoDataGridOptions;
   isItemExcelBusy: boolean = false;

   pageSize = 10;
   businessChainText: any;
   customerData: any = [];
   chainTitle?: string;
   selectedCustItems?: any = [];

   itemText: any;
   itemData: any = [];
   selectedInvItems?: any = [];
   tempSelectedInvItems?: any = [];

   dynamicColumns?: any = [];
   showMatrix: boolean = false;
   dropUOM?: any = [];

   @ViewChild(SohoFileUploadComponent, { static: true }) fileupload?: SohoFileUploadComponent;
   @ViewChild('trackDirty', { static: true }) trackdirty?: SohoTrackDirtyDirective;

   public fileLimits = '.xls,.xlsx';
   public fileUploadDisabled = false;
   public fileUploadReadOnly = false;
   public fileUploadOptions = {
      attributes: {
         name: 'data-automation-id',
         value: 'fileupload-field-automation-id'
      }
   };

   public datePickerOptions: SohoDatePickerOptions = {
      mode: 'standard',
      dateFormat: 'yyyyMMdd'
   }

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
      this.initItemLineGrid();
      this.initMatrixLineGrid();
      this.initItemExcelLineGrid();
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

   initItemLineGrid() {
      const itemOptions: SohoDataGridOptions = {
         selectable: 'multiple' as SohoDataGridSelectable,
         disableRowDeactivation: false,
         clickToSelect: false,
         alternateRowShading: false,
         cellNavigation: true,
         idProperty: 'col-itno',
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
               width: '15%', id: 'col-itno', field: 'ITNO', name: 'Item',
               resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
            },
            {
               width: '65%', id: 'col-itds', field: 'ITDS', name: 'Name',
               resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
            },
            {
               width: '15%', id: 'col-stat', field: 'STAT', name: 'Status',
               resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
            }
         ],
         dataset: [],
         // toolbar: { title: 'Customer List', actions: true, results: true, personalize: true, exportToExcel: true },
         emptyMessage: {
            title: 'Empty Item List',
            icon: 'icon-empty-no-data'
         }
      };
      this.itemGridOptions = itemOptions;
   }

   initMatrixLineGrid() {
      const matrixOptions: SohoDataGridOptions = {
         selectable: 'single' as SohoDataGridSelectable,
         disableRowDeactivation: false,
         clickToSelect: false,
         alternateRowShading: false,
         cellNavigation: false,
         idProperty: 'col-CUNO',
         paging: true,
         pagesize: this.pageSize,
         indeterminate: false,
         filterable: false,
         stickyHeader: false,
         hidePagerOnOnePage: true,
         rowHeight: 'small',
         editable: true,
         columns: [
            {
               width: 150, id: 'col-cuno', field: 'CUNO', name: 'Customer', resizable: true,
            },
            {
               width: 240, id: 'col-cunm', field: 'CUNM', name: 'Name', resizable: true,
            }
         ],
         dataset: [],
         emptyMessage: {
            title: 'Empty Order List',
            icon: 'icon-empty-no-data'
         }
      };
      this.matrixGridOptions = matrixOptions;
   }

   initItemExcelLineGrid() {
      const itemExcelOptions: SohoDataGridOptions = {
         selectable: 'multiple' as SohoDataGridSelectable,
         disableRowDeactivation: false,
         clickToSelect: false,
         alternateRowShading: false,
         cellNavigation: true,
         idProperty: 'col-itno',
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
               width: '15%', id: 'col-itno', field: 'ITNO', name: 'Item',
               resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
            },
            {
               width: '65%', id: 'col-itds', field: 'ITDS', name: 'Name',
               resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
            },
            {
               width: '15%', id: 'col-stat', field: 'STAT', name: 'Status',
               resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
            },
            {
               width: '15%', id: 'col-qty', field: 'QTY', name: 'Quantity',
               resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
            },
            {
               width: '15%', id: 'col-uom', field: 'UOM', name: 'UOM',
               resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
            },
            {
               width: '15%', id: 'col-price', field: 'PRICE', name: 'PRICE',
               resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
            }
         ],
         dataset: [],
         // toolbar: { title: 'Customer List', actions: true, results: true, personalize: true, exportToExcel: true },
         emptyMessage: {
            title: 'Empty Item List',
            icon: 'icon-empty-no-data'
         }
      };
      this.itemExcelGridOptions = itemExcelOptions;
   }

   initData() {
      this.setBusy('initialData', true);
      this.setBusy('initialData', false);
   }

   //Customer Search Start

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
                  this.chainTitle = dialogComponent.selectedChain;
                  if (dialogComponent.selectedChain != undefined && dialogComponent.selectedChain != '-1') {
                     this.LstBusChainCust(dialogComponent.selectedChain);
                  } else {
                     this.customerData = [];
                     this.customerLineDatagrid.toolbar = { 'title': 'Customer List' };
                     this.updateCustomerList();
                  }
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
      this.customerLineDatagrid.toolbar = { 'title': this.chainTitle + ' - Customer List' };
      this.updateCustomerList();
      this.setBusy('custData', false);
   }

   updateCustomerList() {
      this.customerLineDatagrid ? this.customerLineDatagrid.dataset = this.customerData : this.customerLineDatagrid.dataset = this.customerData;
   }

   onSelectedCustItem(args: any) {
      this.selectedCustItems = [];
      if (args.length > 0) {
         args.forEach(item => {
            this.selectedCustItems.push(item.data);
         });
      }
      console.log(this.selectedCustItems);
   }

   //Customer Search End

   //Item search start

   async searchItemData() {
      this.setBusy('itemData', true);
      this.itemData = [];
      const inputRecord_item = {
         SQRY: this.itemText
      };
      const request_item: IMIRequest = {
         program: 'MMS200MI',
         transaction: 'SearchItem',
         record: inputRecord_item,
         outputFields: ['ITNO', 'ITDS', 'STAT']
      };
      await this.miService.execute(request_item)
         .toPromise()
         .then((response: any) => {
            let getItemData = response.items;
            getItemData.forEach((item: any) => {
               this.itemData.push({ 'ITNO': item.ITNO, 'ITDS': item.ITDS, 'STAT': item.STAT });
            });
         })
         .catch(function (error) {
            console.log("Item Data Error", error.errorMessage);
         });
      // console.log(this.itemData);
      this.updateItemList();
      this.setBusy('itemData', false);
   }

   updateItemList() {
      if (this.selectedInvItems.length > 0) {
         let updatedInvItems: any = [];
         this.tempSelectedInvItems = [];
         this.selectedInvItems.forEach((item: any) => {
            updatedInvItems.push(item);
            this.tempSelectedInvItems.push(item);
         });
         this.itemData.forEach((item: any) => {
            updatedInvItems.push(item);
         });
         this.itemData = updatedInvItems;
      }

      this.itemLineDatagrid?.updatePagingInfo({ activePage: 1 });
      this.itemLineDatagrid ? this.itemLineDatagrid.dataset = this.itemData : this.itemLineDatagrid.dataset = this.itemData;

      if (this.tempSelectedInvItems.length > 0) {
         for (let i = 0; i < this.tempSelectedInvItems.length; i++) {
            this.itemLineDatagrid.selectRows(i);
         }
      }
   }

   onSelectedInvItem(args: any) {
      this.selectedInvItems = [];
      if (args.length > 0) {
         args.forEach(item => {
            this.selectedInvItems.push(item.data);
         });
      }
      console.log(this.selectedInvItems);
   }

   //Item search End

   //Matrix Start

   async genMatrix() {
      // console.log("Matrix Click");
      // console.log(this.selectedCustItems);
      // console.log(this.tempSelectedInvItems);
      // console.log(this.selectedInvItems);

      this.dynamicColumns = [];

      if (this.selectedCustItems.length == 0) {
         this.showToast("Customer Error", "Please Select Customer")
      } else if (this.selectedInvItems.length == 0) {
         this.showToast("Item Error", "Please Select Items")
      } else {
         this.setBusy('matrixData', true);
         await this.loadUOM();
         await this.loadOrderColumnData();
      }
   }

   async loadUOM() {
      this.dropUOM = [];
      for await (const item of this.selectedInvItems) {
         const inputRecord_item = {
            ITNO: item.ITNO
         };
         const request_item: IMIRequest = {
            program: 'OIS100MI',
            transaction: 'LstItmAltQty',
            record: inputRecord_item,
            outputFields: ['ALUN', 'AUS2']
         };
         await this.miService.execute(request_item)
            .toPromise()
            .then((response: any) => {
               let getUOMData = response.items;
               let tempDropUOM: any = [];
               getUOMData.forEach((item_uom: any) => {
                  tempDropUOM.push({ id: item_uom.ALUN, label: item_uom.ALUN, value: item_uom.ALUN, AUS2: item_uom.AUS2 });
               });
               tempDropUOM.forEach(function (item: any, i: any) {
                  if (item.AUS2 === "1") {
                     tempDropUOM.splice(i, 1);
                     tempDropUOM.unshift(item);
                  }
               });
               this.dropUOM.push(tempDropUOM);
            })
            .catch(function (error) {
               console.log("UOM Item Data Error", error.errorMessage);
            });

      };
      console.log(this.dropUOM);
   }

   async loadOrderColumnData() {
      this.dynamicColumns.push(
         { width: 150, id: 'col-cuno', field: 'CUNO', name: 'Customer', resizable: true },
         { width: 240, id: 'col-cunm', field: 'CUNM', name: 'Name', resizable: true }
      )
      this.selectedInvItems.forEach((item: any, index: any) => {
         this.dynamicColumns.push(
            {
               width: 200,
               id: 'col-' + item.ITNO,
               field: item.ITNO,
               name: item.ITNO + '-' + item.ITDS,
               resizable: true,
               formatter: Soho.Formatters.Decimal,
               validate: 'required',
               editor: Soho.Editors.Input
            }
         );
         this.dynamicColumns.push(
            {
               width: 60,
               id: 'col-uom-' + item.ITNO,
               field: 'UOM-' + item.ITNO,
               name: 'UOM',
               resizable: true,
               validate: 'required',
               formatter: Soho.Formatters.Dropdown,
               editor: Soho.Editors.Dropdown,
               options: this.dropUOM[index]
            }
         );
         this.dynamicColumns.push(
            {
               width: 100,
               id: 'col-price-' + item.ITNO,
               field: 'PRICE-' + item.ITNO,
               name: 'Price',
               resizable: true,
               formatter: Soho.Formatters.Decimal,
               validate: 'required',
               editor: Soho.Editors.Input
            }
         );
      });
      console.log(this.dynamicColumns);

      const matrixOptions: SohoDataGridOptions = {
         selectable: 'single' as SohoDataGridSelectable,
         disableRowDeactivation: false,
         clickToSelect: false,
         alternateRowShading: false,
         actionableMode: true,
         cellNavigation: true,
         rowNavigation: true,
         idProperty: 'col-CUNO',
         paging: true,
         pagesize: this.pageSize,
         indeterminate: false,
         filterable: false,
         stickyHeader: false,
         hidePagerOnOnePage: true,
         rowHeight: 'small',
         editable: true,
         columns: this.dynamicColumns,
         frozenColumns: {
            // left: ['col-cuno', 'col-cunm']
         },
         emptyMessage: {
            title: 'Empty Order List',
            icon: 'icon-empty-no-data'
         }
      };

      this.matrixGridOptions = matrixOptions;
      setTimeout(() => {
         this.updateMatrixGrid();
      }, 500);
   }

   updateMatrixGrid() {
      this.matrixLineDatagrid ? this.matrixLineDatagrid.dataset = this.selectedCustItems : this.matrixLineDatagrid.dataset = this.selectedCustItems;
      this.setBusy('matrixData', false);
   }

   clearAll() {

   }

   onCellChange(event: any) {
      // console.log(event.row);
      // console.log(event.rowData);
      // console.log(event.cell);
      // console.log(event.value);
      this.matrixLineDatagrid.updateRow(event.row, event.rowData);
      let cellNo = event.cell;
      let cellValue = event.value;
      console.log(this.matrixLineDatagrid.dataset);

   }

   checkOrder() {
      this.matrixLineDatagrid.validateAll();
   }

   genOrder() {
      const dialog = this.modalDialog.modal(CreateModalComponent);

      dialog.buttons([
         {
            text: 'Cancel',
            click: () => dialog.close()
         },
         {
            text: 'Create Order',
            isDefault: true,
            click: () => dialog.close(true)
         }
      ])

         .title(`Create Order`)
         .apply((comp: CreateModalComponent) => {

         })
         .open()
         .afterClose((result) => {
            if (result) {
            }
         });
   }

   //Matrix End

   //Upload Excel start

   onExcelChange(event: any) {
      console.log('onChange', event);
   }

   //UPload Excel End

   private setBusy(isCall: string, isBusy: boolean) {
      if (isCall == "initialData") {
         this.isInitItemBusy = isBusy;
      } else if (isCall == "custData") {
         this.isCustItemBusy = isBusy;
      } else if (isCall == "itemData") {
         this.isItemBusy = isBusy;
      } else if (isCall == "matrixData") {
         this.isMatrixBusy = isBusy;
      }
   }

   showToast(title: any, message: any) {
      this.toastService.show({ draggable: true, title: title, message: message });
   }

}
