import { Component, OnInit } from '@angular/core';
import { CoreBase, Log } from '@infor-up/m3-odin';

@Component({
   selector: 'app-prsg-gen-app',
   templateUrl: './prsg-gen-app.component.html',
   styleUrls: ['./prsg-gen-app.component.css']
})
export class PrsgGenAppComponent extends CoreBase implements OnInit {

   title = 'Puerto Rico Supplies Group Quick Order Entry';

   constructor() {
      super('PrsgGenAppComponent');
      Log.setDebug();
   }

   ngOnInit(): void {
   }

}
