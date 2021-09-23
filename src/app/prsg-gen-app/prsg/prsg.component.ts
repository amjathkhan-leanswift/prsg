import {
   Component,
   OnInit,
   ViewContainerRef,
   ViewChild
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
   SohoFileUploadComponent, SohoTrackDirtyDirective, SohoLookupComponent
} from 'ids-enterprise-ng';

import { ChainModalComponent } from './chain-modal/chain-modal.component'
import { CreateModalComponent } from './create-modal/create-modal.component';
import { ItemModalComponent } from './item-modal/item-modal.component';
import { GlobalConstants } from './global-constants';

import * as XLSX from 'xlsx';

@Component({
   selector: 'app-prsg',
   templateUrl: './prsg.component.html',
   styleUrls: ['./prsg.component.css']
})
export class PrsgComponent extends CoreBase implements OnInit {

   @ViewChild('dialogPlaceholder', { read: ViewContainerRef, static: true })
   placeholder?: ViewContainerRef;

   isInitItemBusy: boolean = false;
   maxRecords = 10000;

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
   businessChainText1: any;
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
   itemText1: any;

   public datePickerOptions: SohoDatePickerOptions = {
      mode: 'standard',
      dateFormat: 'yyyyMMdd'
   }

   excellistFaciData: any = [];
   excellistOrderData: any = [];
   excellistWareHouseData: any = [];
   excellistSalesRep: any = [];
   excellistCustmer: any = [];
   excellistBusChain: any = [];

   excelsaleRepTemplate = `<script type="text/html">
      <li id="{{listItemId}}" {{#hasValue}} data-value="{{value}}" {{/hasValue}} role="listitem">
         <a tabindex="-1">
            <span class="display-value">{{{label}}}</span>
            <!--span class="display-value display-newline"></span-->
         </a>
      </li>
      </script>`;

   excelcustTemplate = `<script type="text/html">
      <li id="{{listItemId}}" {{#hasValue}} data-value="{{value}}" {{/hasValue}} role="listitem">
         <a tabindex="-1">
            <span class="display-value">{{{label}}}</span>
            <!--span class="display-value display-newline"></span-->
         </a>
      </li>
      </script>`;

   excelItemTemplate = `<script type="text/html">
      <li id="{{listItemId}}" {{#hasValue}} data-value="{{value}}" {{/hasValue}} role="listitem">
         <a tabindex="-1">
            <span class="display-value">{{{label}}}</span>
            <!--span class="display-value display-newline"></span-->
         </a>
      </li>
      </script>`;

   excelChainTemplate = `<script type="text/html">
      <li id="{{listItemId}}" {{#hasValue}} data-value="{{value}}" {{/hasValue}} role="listitem">
         <a tabindex="-1">
            <span class="display-value">{{{label}}}</span>
            <!--span class="display-value display-newline"></span-->
         </a>
      </li>
      </script>`;

   exceldataFacility?: any;
   exceldataOrderType?: any;
   exceldataWarehouse?: any;
   exceldataDeliveryDate?: any;
   exceldataSalesRep?: any;
   exceldataCustomer?: any;

   exceldatatempCustomer?: any;
   exceldatatempSalesRep?: any;
   isCustomerBusy: boolean = false;
   excelDataArr?: any = [];

   itemOrderArray: any = [];
   public orderData: any = {
      FACI: null,
      ORTP: null,
      WHLO: null,
      DWDT: null,
      SMCD: null
   }
   dialog?: SohoMessageRef;
   closeResult?: string;
   orderItemError?: any = [];

   isAddItemBusy: boolean = false;
   excelAdditemData?: any = [];
   tempAddItem?: any = []

   @ViewChild(SohoLookupComponent, { static: true }) sohoLookup?: SohoLookupComponent;
   lookupValue = '';
   tempModalItem?: any = [];

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
            },
            {
               width: '15%', id: 'col-itty', field: 'ITTY', name: 'Type',
               resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
            },
            {
               width: '15%', id: 'col-itgr', field: 'ITGR', name: 'Group',
               resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
            }
         ],
         dataset: [],
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
               width: '35%', id: 'col-itno', field: 'ITNO', name: 'Item',
               resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
            },
            {
               width: '20%', id: 'col-orqt', field: 'ORQT', name: 'Quantity',
               resizable: true, formatter: Soho.Formatters.Decimal, editor: Soho.Editors.Input
            },
            {
               width: '20%', id: 'col-alun', field: 'ALUN', name: 'UOM',
               resizable: true, editor: Soho.Editors.Input
            },
            {
               width: '20%', id: 'col-sapr', field: 'SAPR', name: 'Price',
               resizable: true, formatter: Soho.Formatters.Decimal, editor: Soho.Editors.Input
            }
         ],
         dataset: [],
         emptyMessage: {
            title: 'Empty Item List',
            icon: 'icon-empty-no-data'
         }
      };
      this.itemExcelGridOptions = itemExcelOptions;
   }

   wastetest() {
      // ,
      // {
      //    width: '32%', id: 'col-itds', field: 'ITDS', name: 'Name',
      //       resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
      // },
      // {
      //    width: '8%', id: 'col-stat', field: 'STAT', name: 'Status',
      //       resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
      // },
      // {
      //    width: '8%', id: 'col-itty', field: 'ITTY', name: 'Type',
      //       resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
      // },
      // {
      //    width: '8%', id: 'col-itgr', field: 'ITGR', name: 'Group',
      //       resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
      // },
   }

   async initData() {
      this.setBusy('initialData', true);
      await this.excelinitListFacility();
      await this.excelinitLstOrderTypes();
      await this.excelinitLstWarehouses();
      await this.excelinitSalesRep();
      await this.excelinitBusChain();
      this.setBusy('initialData', false);
   }

   //Customer Search Start

   searchBusinessChain() {
      if (this.businessChainText1 != '' && this.businessChainText1 != null) {
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

            .title(`${this.businessChainText1} - Business Chain List`)
            .apply((comp: ChainModalComponent) => {
               comp.businessChainData = this.businessChainText1;
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
         outputFields: ['CUNO'],
         maxReturnedRecords: this.maxRecords
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
            outputFields: ['CUNO', 'CUNM', 'CUA1', 'CUA2', 'TOWN'],
            maxReturnedRecords: this.maxRecords
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
      this.customerLineDatagrid.toolbar = { 'title': this.chainTitle + ' - Customer List', actions: true, results: true, personalize: true, exportToExcel: true };
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
      let term_temp = '((ITNO:' + this.itemText + '*) OR (ITNO:' + this.itemText + ') OR (ITDS:' + this.itemText + '*) OR (ITDS:' + this.itemText + '))';
      const inputRecord_item = {
         SQRY: term_temp
      };

      const request_item: IMIRequest = {
         program: 'MDBREADMI',
         transaction: 'SelMITMAS00IES',
         record: inputRecord_item,
         outputFields: ['ITNO', 'ITDS', 'STAT', 'ITTY', 'ITGR'],
         maxReturnedRecords: this.maxRecords
      };
      await this.miService.execute(request_item)
         .toPromise()
         .then((response: any) => {
            let getItemData = response.items;
            getItemData.forEach((item: any) => {
               this.itemData.push({ 'ITNO': item.ITNO, 'ITDS': item.ITDS, 'STAT': item.STAT, 'ITTY': item.ITTY, 'ITGR': item.ITGR });
            });
         })
         .catch(function (error) {
            console.log("Item Data Error", error.errorMessage);
         });
      // console.log(this.itemData);
      this.updateItemList();
      this.setBusy('itemData', false);

      //this.itemDataList();
   }
   async itemDataList() {
      if (this.itemData.length > 0) {
         let i = 0;

         for await (const item of this.itemData) {
            const inputRecord_itemdata = {
               ITNO: item.ITNO
            };
            const request_itemdata: IMIRequest = {
               program: 'MMS200MI',
               transaction: 'GetItmBasic',
               record: inputRecord_itemdata,
               outputFields: ['ITTY', 'ITGR'],
               maxReturnedRecords: this.maxRecords
            };
            await this.miService.execute(request_itemdata)
               .toPromise()
               .then((response: any) => {
                  let getItemData = response.items;
                  getItemData.forEach((itemDetail: any) => {
                     this.itemData[i].ITTY = itemDetail.ITTY;
                     this.itemData[i].ITGR = itemDetail.ITGR;
                  });
                  i++;
               })
               .catch(function (error) {
                  console.log("Item Data Error", error.errorMessage);
               });
         };
      };
      //console.log(this.itemData);
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

      this.dynamicColumns = [];

      if (this.selectedCustItems.length == 0) {
         this.showToast("Customer Error", "Please Select Customer")
      } else if (this.selectedInvItems.length == 0) {
         this.showToast("Item Error", "Please Select Items")
      } else {
         this.setBusy('matrixData', true);
         await this.loadUOM(this.selectedInvItems);
         await this.loadOrderColumnData();
      }
   }

   async loadUOM(invItems: any) {
      this.dropUOM = [];
      for await (const item of invItems) {
         const inputRecord_item = {
            ITNO: item.ITNO
         };
         const request_item: IMIRequest = {
            program: 'OIS100MI',
            transaction: 'LstItmAltQty',
            record: inputRecord_item,
            outputFields: ['ALUN', 'AUS2'],
            maxReturnedRecords: this.maxRecords
         };
         await this.miService.execute(request_item)
            .toPromise()
            .then((response: any) => {
               let getUOMData = response.items;
               let tempDropUOM: any = [];
               getUOMData.forEach((item_uom: any) => {
                  tempDropUOM.push({ id: item_uom.ALUN, label: item_uom.ALUN, value: item_uom.ALUN, AUS2: item_uom.AUS2 });
               });
               tempDropUOM.push({ id: '', label: '', value: '', AUS2: 0 });
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
               // validate: 'required',
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
               // validate: 'required',
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
               // validate: 'required',
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
      this.matrixLineDatagrid.dataset = [];
      this.initMatrixLineGrid();
      this.customerLineDatagrid.dataset = [];
      this.customerLineDatagrid.toolbar = { 'title': 'Customer List', actions: true, results: true, personalize: true, exportToExcel: true };
      this.itemLineDatagrid.dataset = [];
      this.itemOrderArray = [];
      this.orderData = [];
      this.businessChainText = null;
      this.businessChainText1 = null;
      this.itemText = null;

   }

   onCellChange(event: any) {
      // console.log(event.row);
      // console.log(event.rowData);
      // console.log(event.cell);
      // console.log(event.value);
      this.matrixLineDatagrid.updateRow(event.row, event.rowData);

   }

   // checkOrder() {
   //    this.matrixLineDatagrid.validateAll();
   // }

   async genOrder() {
      if (this.matrixLineDatagrid.dataset.length > 0) {
         await this.prepOrder();
         if (this.itemOrderArray.length > 0) {
            await this.openOrder();
         } else {
            this.showToast("Order Error", "Empty Order List");
         }

      } else {
         this.showToast("Order Error", "Empty Order List");
      }

   }

   async prepOrder() {
      // console.log(this.selectedCustItems);
      // console.log(this.selectedInvItems);
      // console.log(this.matrixLineDatagrid.dataset);

      this.itemOrderArray = [];

      this.selectedCustItems.forEach((custItem: any) => {
         let custNumber = custItem.CUNO;
         var custCheck = this.matrixLineDatagrid.dataset.find(x => (x.CUNO === custItem.CUNO));
         if (custCheck) {
            let tempArray: any = [];
            let i = 0;
            this.selectedInvItems.forEach((invItem: any) => {
               let itemKey = Object.keys(custCheck).filter(key => key.startsWith(invItem.ITNO))[0];
               let uomKey = Object.keys(custCheck).filter(key => key.startsWith('UOM-' + invItem.ITNO))[0];
               let priceKey = Object.keys(custCheck).filter(key => key.startsWith('PRICE-' + invItem.ITNO))[0];
               if (itemKey) {
                  if (custCheck[itemKey].trim() != "") {
                     tempArray.push({ 'ITNO': itemKey, 'ORQT': custCheck[itemKey] });
                     if (uomKey) {
                        if (custCheck[uomKey].trim() != "") {
                           tempArray[i].ALUN = custCheck[uomKey];
                        }
                     }
                     if (priceKey) {
                        if (custCheck[priceKey].trim() != "") {
                           tempArray[i].SAPR = custCheck[priceKey];
                        }
                     }
                     i++;
                  }
               }
            });
            this.itemOrderArray.push({ 'CUNO': custNumber, 'ORDER': tempArray });
         }
      });
      console.log(this.itemOrderArray);
   }

   async openOrder() {
      const dialog = this.modalDialog.modal(CreateModalComponent);
      let dialogComponent: CreateModalComponent;
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
            comp.listFaciData = this.excellistFaciData;
            comp.listOrderData = this.excellistOrderData;
            comp.listWareHouseData = this.excellistWareHouseData;
            comp.listSalesRep = this.excellistSalesRep;
            dialogComponent = comp;
         })
         .open()
         .afterClose((result) => {
            if (result) {
               this.orderData.FACI = dialogComponent.dataFacility;
               this.orderData.ORTP = dialogComponent.dataOrderType;
               this.orderData.WHLO = dialogComponent.dataWarehouse;
               this.orderData.DWDT = dialogComponent.dataDeliveryDate;
               this.orderData.SMCD = dialogComponent.dataSalesRep;
               this.createOrder();
            }
         });

   }

   async createOrder() {
      // console.log(this.itemOrderArray);
      // console.log(this.orderData);
      this.setBusy('initialData', true);
      this.orderItemError = [];
      GlobalConstants.orderError = 0;
      for await (const item of this.itemOrderArray) {
         const inputRecord_head = {
            CUNO: item.CUNO,
            ORTP: this.orderData.ORTP,
            FACI: this.orderData.FACI,
            SMCD: this.orderData.SMCD,
            RLDT: this.orderData.DWDT
         };
         const request_head: IMIRequest = {
            program: 'OIS100MI',
            transaction: 'AddBatchHead',
            record: inputRecord_head,
            outputFields: ['ORNO']
         };
         await this.miService.execute(request_head)
            .toPromise()
            .then(async (response: any) => {
               let getORNOData = response.item;
               let ornoValue = getORNOData.ORNO;
               // console.log(ornoValue);
               for await (const itemOrder of item.ORDER) {
                  let inputRecord_line = {
                     ORNO: ornoValue,
                     ITNO: itemOrder.ITNO,
                     ORQT: itemOrder.ORQT,
                     WHLO: this.orderData.WHLO,
                     DWDT: this.orderData.DWDT
                  };
                  if (itemOrder.ALUN) {
                     inputRecord_line['ALUN'] = itemOrder.ALUN;
                  }
                  if (itemOrder.SAPR) {
                     inputRecord_line['SAPR'] = itemOrder.SAPR;
                  }
                  const request_line: IMIRequest = {
                     program: 'OIS100MI',
                     transaction: 'AddBatchLine',
                     record: inputRecord_line
                  };
                  await this.miService.execute(request_line)
                     .toPromise()
                     .then(async (response: any) => {
                        GlobalConstants.orderError = 0;
                        console.log(response.items);
                     })
                     .catch(function (error) {
                        GlobalConstants.orderError = 1;
                        console.log("Add Batch Line Error", error.errorMessage);
                     });
                  if (GlobalConstants.orderError == 1) {
                     this.orderItemError.push({ 'ITNO': itemOrder.ITNO });
                  }
               }

               let inputRecord_conf = {
                  ORNO: ornoValue,
               }
               const request_line_conf: IMIRequest = {
                  program: 'OIS100MI',
                  transaction: 'Confirm',
                  record: inputRecord_conf,
                  outputFields: ['ORNO', 'STAT']
               };
               await this.miService.execute(request_line_conf)
                  .toPromise()
                  .then((response: any) => {
                     console.log(response.items);
                  })
                  .catch(function (error) {
                     // GlobalConstants.orderError = 1;
                     console.log("Confirmation Error", error.errorMessage);
                  });

            })
            .catch(function (error) {
               console.log("Add Batch Head Error", error.errorMessage);
            });
      };
      this.setBusy('initialData', false);
      console.log(this.orderItemError);
      this.openSuccess();
   }

   openSuccess() {
      const buttons = [{
         text: 'Done',
         click: (_e: any, modal: any) => {
            this.closeResult = 'Done';
            (this.dialog as any) = null;
            modal.close(true);
            this.clearAll();
            this.clearExcelAll();
         },
         isDefault: true
      }];

      let errorOrder = "";
      let errorMsg = '<span class="message"> Order Created Successfully </span><br>';
      if (this.orderItemError.length > 0) {
         this.orderItemError.forEach((order: any) => {
            errorOrder = errorOrder + order.ITNO + " ";
         })
         errorMsg = '<span class="message"> Order Created Successfully </span><br><br><p class="message1">Some of Items Failed</P><br><p>Items does not exists in the Warehouse</p><br>' + errorOrder;
      }

      this.dialog = (this.messageService as any)
         .message()
         .title('<span>Order Status</span>')
         .message(errorMsg)
         .buttons(buttons)
         .beforeClose(() => {
            return true;
         }).beforeOpen(() => {
            return true;
         }).opened(() => {

         })
         .open();
   }
   //Matrix End

   //Upload Excel start

   async excelinitListFacility() {
      this.excellistFaciData = [];
      const request_faci: IMIRequest = {
         program: 'CRS008MI',
         transaction: 'ListFacility',
         outputFields: ['FACI', 'FACN'],
         maxReturnedRecords: this.maxRecords
      };

      await this.miService.execute(request_faci)
         .toPromise()
         .then((response: any) => {
            // console.log(response.items);
            this.excellistFaciData = response.items;
         })
         .catch(function (error) {
            console.log("List Facility Error", error.errorMessage);
         });
   }

   async excelinitLstOrderTypes() {
      this.excellistOrderData = [];
      const request: IMIRequest = {
         program: 'OIS010MI',
         transaction: 'LstOrderTypes',
         outputFields: ['ORTP', 'TX40'],
         maxReturnedRecords: this.maxRecords
      };

      await this.miService.execute(request)
         .toPromise()
         .then((response: any) => {
            // console.log(response.items);
            this.excellistOrderData = response.items;
         })
         .catch(function (error) {
            console.log("List Order Data Error", error.errorMessage);
         });
   }

   async excelinitLstWarehouses() {
      this.excellistWareHouseData = [];
      const request: IMIRequest = {
         program: 'MMS005MI',
         transaction: 'LstWarehouses',
         outputFields: ['WHLO', 'WHNM'],
         maxReturnedRecords: this.maxRecords
      };

      await this.miService.execute(request)
         .toPromise()
         .then((response: any) => {
            // console.log(response.items);
            this.excellistWareHouseData = response.items;
         })
         .catch(function (error) {
            console.log("List Order Data Error", error.errorMessage);
         });
   }

   async excelinitSalesRep() {
      this.excellistSalesRep = [];
      const request: IMIRequest = {
         program: 'CRS100MI',
         transaction: 'List',
         outputFields: ['SMCD', 'TX40', 'SDEP', 'BUAR'],
         maxReturnedRecords: this.maxRecords
      };

      await this.miService.execute(request)
         .toPromise()
         .then((response: any) => {
            // console.log(response.items);
            let templistSalesRep = response.items;
            templistSalesRep.forEach((item: any) => {
               this.excellistSalesRep.push({ 'label': item.SDEP + ' - ' + item.SMCD + ' - ' + item.TX40, 'smcd': item.SMCD, 'value': item.SMCD + ' - ' + item.TX40 });
            });
         })
         .catch(function (error) {
            console.log("List Sales Rep Data Error", error.errorMessage);
         });
   }

   public excellistSalesRepSource = (term: string, response: any) => {
      response(term, this.excellistSalesRep);
   }

   async excelinitBusChain() {
      this.excellistBusChain = [];
      const request: IMIRequest = {
         program: 'CMS100MI',
         transaction: 'LstBusChain',
         outputFields: ['OGCHAI', 'OKCUNM'],
         maxReturnedRecords: this.maxRecords
      };
      await this.miService.execute(request)
         .toPromise()
         .then((response: any) => {
            // console.log(response.items);
            let templistBusChain = response.items;
            templistBusChain.forEach((item: any) => {
               this.excellistBusChain.push({
                  'label': item.OGCHAI + ' - ' + item.OKCUNM, 'ogchai': item.OGCHAI, 'okcunm': item.OKCUNM, 'value': item.OGCHAI + ' - ' + item.OKCUNM
               });
            });
         })
         .catch(function (error) {
            console.log("List Business Chain Data Error", error.errorMessage);
         });
   }

   public excellistBusChainSource = (term: string, response: any) => {
      response(term, this.excellistBusChain);
   }

   public excellistCUstomerSource = async (term: string, response: any) => {
      this.setBusy('customerData', true);

      this.excellistCustmer = [];
      let term_temp = '((CUNO:' + term + '*) OR (CUNO:' + term + ') OR (CUNM:' + term + '*) OR (CUNM:' + term + '))';
      const input_cuno = {
         SQRY: term_temp
      }
      const request_cuno: IMIRequest = {
         program: 'CRS610MI',
         transaction: 'SearchCustomer',
         record: input_cuno,
         outputFields: ['CUNO', 'CUNM'],
         maxReturnedRecords: this.maxRecords
      };

      await this.miService.execute(request_cuno)
         .toPromise()
         .then((response_cuno: any) => {
            let custTempItems = response_cuno.items;
            custTempItems.forEach((item: any) => {
               this.excellistCustmer.push({ 'label': item.CUNO + ' - ' + item.CUNM, 'cuno': item.CUNO, 'value': item.CUNO + ' - ' + item.CUNM });
            });
         })
         .catch(function (error) {
            console.log("Customer Error:", error.errorMessage);
         });

      response(term, this.excellistCustmer);
      this.setBusy('customerData', false);
   }

   onSelectedSalesRepExcel(event: any) {
      this.exceldataSalesRep = event[2].smcd;
   }

   onSelectedBusChainExcel(event: any) {
      this.businessChainText = event[2].label;
      this.businessChainText1 = event[2].ogchai;
   }

   onSelectedCustomerExcel(event: any) {
      this.exceldataCustomer = event[2].cuno;
   }

   onExcelChange(event: any) {
      this.excelDataArr = [];
      /* wire up file reader */
      const target: DataTransfer = <DataTransfer>(event.target);
      if (target.files.length !== 1) {
         throw new Error('Cannot use multiple files');
      }
      const reader: FileReader = new FileReader();
      reader.readAsBinaryString(target.files[0]);
      reader.onload = (e: any) => {
         /* create workbook */
         const binarystr: string = e.target.result;
         const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: 'binary' });

         /* selected the first sheet */
         const wsname: string = wb.SheetNames[0];
         const ws: XLSX.WorkSheet = wb.Sheets[wsname];

         /* save data */
         const data = XLSX.utils.sheet_to_json(ws); // to get 2d array pass 2nd parameter as object {header: 1}
         this.excelDataArr = data;
      };

   }
   async updateExcelGrid() {
      this.setBusy('excelData', true);
      //await this.loadUOM(this.excelDataArr);
      this.itemExcelLineDatagrid ? this.itemExcelLineDatagrid.dataset = this.excelDataArr : this.itemExcelLineDatagrid.dataset = this.excelDataArr;
      this.setBusy('excelData', false);
   }

   onExcelCellChange(event: any) {
      this.itemExcelLineDatagrid.updateRow(event.row, event.rowData);
   }

   public excellistAddItemSource = async (term: string, response: any) => {
      this.setBusy('addItemData', true);

      this.excelAdditemData = [];
      let term_temp = '((ITNO:' + term + '*) OR (ITNO:' + term + ') OR (ITDS:' + term + '*) OR (ITDS:' + term + '))';

      const inputRecord_item = {
         SQRY: term_temp
      };

      const request_item: IMIRequest = {
         program: 'MDBREADMI',
         transaction: 'SelMITMAS00IES',
         record: inputRecord_item,
         outputFields: ['ITNO', 'ITDS', 'STAT', 'ITTY', 'ITGR'],
         maxReturnedRecords: this.maxRecords
      };
      await this.miService.execute(request_item)
         .toPromise()
         .then((response: any) => {
            let getItemData = response.items;
            getItemData.forEach((item: any) => {
               this.excelAdditemData.push({ 'label': item.ITNO + ' - ' + item.ITDS, 'ITNO': item.ITNO, 'ITDS': item.ITDS, 'STAT': item.STAT, 'ITTY': item.ITTY, 'ITGR': item.ITGR, 'value': item.ITNO });
            });
         })
         .catch(function (error) {
            console.log("Item Data Error", error.errorMessage);
         });

      response(term, this.excelAdditemData);
      this.setBusy('addItemData', false);
   }

   onSelectedAddItemExcel(event: any) {
      this.tempAddItem = [];
      this.tempAddItem.push({ 'ITNO': event[2].ITNO, 'ITDS': event[2].ITDS, 'STAT': event[2].STAT, 'ITTY': event[2].ITTY, 'ITGR': event[2].ITGR });
   }
   addItemExcel() {
      this.excelDataArr = [];
      this.excelDataArr = this.itemExcelLineDatagrid.dataset;
      console.log(this.excelDataArr);
      var itemCheck = this.excelDataArr.find((x: any) => (x.ITNO + "" === this.tempAddItem[0].ITNO));
      console.log(itemCheck);

      if (!itemCheck) {
         this.excelDataArr.push(this.tempAddItem[0]);
         this.updateExcelGrid();
      } else {
         this.showToast('Item Error', 'Item already exist in the list');
      }
      //console.log(this.excelDataArr);
   }

   clearExcelAll() {
      this.exceldataFacility = null;
      this.exceldataOrderType = null;
      this.exceldataWarehouse = null;
      this.exceldataDeliveryDate = null;
      this.exceldataSalesRep = null;
      this.exceldataCustomer = null;
      this.exceldatatempCustomer = null;
      this.exceldatatempSalesRep = null;
      this.fileupload.clearUploadFile();
      this.itemText1 = null;
      this.excelDataArr = [];
      this.lookupValue = "";
      this.updateExcelGrid();
   }

   isEnabled(): boolean {
      return !!this.exceldataFacility && !!this.exceldataOrderType && !!this.exceldataWarehouse && !!this.exceldataDeliveryDate && !!this.exceldataSalesRep && !!this.exceldataCustomer && (this.excelDataArr.length > 0) && (this.exceldataFacility != "-1") && (this.exceldataOrderType != "-1") && (this.exceldataWarehouse != "-1") && (this.itemExcelLineDatagrid.dataset.length > 0);
   }

   async genExcelOrder() {
      this.setBusy('initialData', true);
      this.orderItemError = [];
      GlobalConstants.orderError = 0;

      const inputRecord_head = {
         CUNO: this.exceldataCustomer,
         ORTP: this.exceldataOrderType,
         FACI: this.exceldataFacility,
         SMCD: this.exceldataSalesRep,
         RLDT: this.exceldataDeliveryDate
      };
      const request_head: IMIRequest = {
         program: 'OIS100MI',
         transaction: 'AddBatchHead',
         record: inputRecord_head,
         outputFields: ['ORNO']
      };
      await this.miService.execute(request_head)
         .toPromise()
         .then(async (response: any) => {
            let getORNOData = response.item;
            let ornoValue = getORNOData.ORNO;
            for await (const itemOrder of this.itemExcelLineDatagrid.dataset) {
               console.log(itemOrder.ORQT);
               if (itemOrder.ORQT && (itemOrder.ORQT != "")) {
                  let inputRecord_line = {
                     ORNO: ornoValue,
                     ITNO: itemOrder.ITNO,
                     ORQT: itemOrder.ORQT,
                     WHLO: this.exceldataWarehouse,
                     DWDT: this.exceldataDeliveryDate
                  };
                  if (itemOrder.ALUN) {
                     inputRecord_line['ALUN'] = itemOrder.ALUN;
                  }
                  if (itemOrder.SAPR) {
                     inputRecord_line['SAPR'] = itemOrder.SAPR;
                  }
                  const request_line: IMIRequest = {
                     program: 'OIS100MI',
                     transaction: 'AddBatchLine',
                     record: inputRecord_line
                  };
                  await this.miService.execute(request_line)
                     .toPromise()
                     .then(async (response: any) => {
                        GlobalConstants.orderError = 0;
                        console.log(response.items);

                     })
                     .catch(function (error) {
                        GlobalConstants.orderError = 1;
                        console.log("Add Batch Line Error", error.errorMessage);
                     });
                  if (GlobalConstants.orderError == 1) {
                     this.orderItemError.push({ 'ITNO': itemOrder.ITNO });
                  }
               }
            }
            let inputRecord_conf = {
               ORNO: ornoValue,
            }
            const request_line_conf: IMIRequest = {
               program: 'OIS100MI',
               transaction: 'Confirm',
               record: inputRecord_conf,
               outputFields: ['ORNO', 'STAT']
            };
            await this.miService.execute(request_line_conf)
               .toPromise()
               .then((response: any) => {
                  console.log(response.items);
               })
               .catch(function (error) {
                  //GlobalConstants.orderError = 1;
                  console.log("Confirmation Error", error.errorMessage);
               });

         })
         .catch(function (error) {
            console.log("Add Batch Head Error", error.errorMessage);
         });

      this.setBusy('initialData', false);
      console.log(this.orderItemError);
      this.openSuccess();
   }

   removeExcelItem() {
      const buttons = [
         {
            text: 'Yes', click: (_e: any, modal: any) => {
               this.closeResult = 'Yes';
               (this.dialog as any) = null;

               this.itemExcelLineDatagrid.removeSelected();
               modal.close(true);
            }
         },
         {
            text: 'No', click: (_e: any, modal: any) => {
               this.closeResult = 'No';
               (this.dialog as any) = null;
               this.itemExcelLineDatagrid.unSelectAllRows();
               modal.close(true);
            },
            isDefault: true
         }];

      if (this.itemExcelLineDatagrid.dataset.length > 0) {
         this.dialog = (this.messageService as any)
            .message()
            .title('<span>Delete these Items?</span>')
            .message('<span class="message">You are about to delete this items. Would you like to proceed?</span>')
            .buttons(buttons)
            .beforeClose(() => {
               return true;
            }).beforeOpen(() => {
               return true;
            }).opened(() => {
            })
            .open();
      } else {
         this.showToast('Item List', 'Empty Item List');
      }
   }

   onLookupClick = () => {
      const dialog = this.modalDialog.modal(ItemModalComponent);
      let dialogComponent: ItemModalComponent;

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
         .open()
         .apply((comp: ItemModalComponent) => {
            comp.lookupValue = this.lookupValue;
            dialogComponent = comp;
         })
         .afterClose((result) => {
            if (result && this.sohoLookup) {
               this.tempModalItem = [];
               this.tempModalItem = dialogComponent.selectedItem;
               this.addItemModal();
               // console.log(dialogComponent.selectedItem);
            }
         });
   }

   addItemModal() {
      this.excelDataArr = [];
      this.excelDataArr = this.itemExcelLineDatagrid.dataset;

      this.tempModalItem.forEach((item: any) => {
         var itemCheck = this.excelDataArr.find((x: any) => (x.ITNO + "" === item.ITNO));
         if (!itemCheck) {
            this.excelDataArr.push(item);
         } else {
            this.showToast(item.ITNO, 'Item already exist in the list');
         }
      });
      this.updateExcelGrid();
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
      } else if (isCall == "customerData") {
         this.isCustomerBusy = isBusy;
      } else if (isCall == "excelData") {
         this.isItemExcelBusy = isBusy;
      } else if (isCall == "addItemData") {
         this.isAddItemBusy = isBusy;
      }

   }

   showToast(title: any, message: any) {
      this.toastService.show({ draggable: true, title: title, message: message });
   }

}
