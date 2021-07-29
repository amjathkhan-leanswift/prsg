import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { CoreBase, IMIRequest, IMIResponse, IUserContext } from '@infor-up/m3-odin';
import { MIService, UserService } from '@infor-up/m3-odin-angular';
import {
   SohoDataGridComponent

} from 'ids-enterprise-ng';

@Component({
   selector: 'app-item-modal',
   templateUrl: './item-modal.component.html',
   styleUrls: ['./item-modal.component.css']
})
export class ItemModalComponent implements OnInit {

   @ViewChild('itemModalDatagrid') itemModalDatagrid: SohoDataGridComponent;
   itemModalGridOptions: SohoDataGridOptions;
   isItemModalBusy: boolean = false;

   maxRecords = 10000;
   pageSize = 10;
   selectedItem = [];

   @Input() lookupValue: any;
   itemModalData?: any = [];

   constructor(private miService: MIService) { }

   ngOnInit(): void {
      this.initialModalData();
   }

   async initialModalData() {
      await this.initItemModalLineGrid();
      await this.loadItemModalData();
   }
   async initItemModalLineGrid() {
      const itemModalOptions: SohoDataGridOptions = {
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
               width: '35%', id: 'col-itds', field: 'ITDS', name: 'Name',
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
      this.itemModalGridOptions = itemModalOptions;
   }
   async loadItemModalData() {
      this.setBusy('itemModalData', true);
      this.itemModalData = [];
      let term_temp = '((ITNO:' + this.lookupValue + '*) OR (ITNO:' + this.lookupValue + ') OR (ITDS:' + this.lookupValue + '*) OR (ITDS:' + this.lookupValue + '))';
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
               this.itemModalData.push({ 'ITNO': item.ITNO, 'ITDS': item.ITDS, 'STAT': item.STAT, 'ITTY': item.ITTY, 'ITGR': item.ITGR });
            });
         })
         .catch(function (error) {
            console.log("Item Data Error", error.errorMessage);
         });
      console.log(this.itemModalData);
      this.updateItemModalList();
      this.setBusy('itemModalData', false);
   }

   updateItemModalList() {
      this.itemModalDatagrid ? this.itemModalDatagrid.dataset = this.itemModalData : this.itemModalDatagrid.dataset = this.itemModalData;
   }

   onSelectedItem(args: any) {
      this.selectedItem = [];
      if (args.length > 0) {
         args.forEach(item => {
            this.selectedItem.push(item.data);
         });
      }
   }

   private setBusy(isCall: string, isBusy: boolean) {
      if (isCall == "itemModalData") {
         this.isItemModalBusy = isBusy;
      }
   }

}
