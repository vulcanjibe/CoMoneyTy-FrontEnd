import { Component } from '@angular/core';

import {  LoadingController ,ViewController,NavParams} from 'ionic-angular';

import {Constante, Operation, OperationAvecDepense} from '../cmy-model/cmy.model';
import {Restangular} from 'ngx-restangular';
@Component({
  selector: 'modal-choix-operation',
  templateUrl: 'modal-choix-operation.html'
})
export class ModalChoixOperation {
  loading: any;
  operations:Array<OperationAvecDepense>;
  operationsComplete:Array<OperationAvecDepense>;
  event:Event;
  constructor(
    public loadingCtrl: LoadingController,
    public constante:Constante,
    public viewCtrl: ViewController,
    private restangular: Restangular,
    private navParam:NavParams
  ) {
    this.loading = this.loadingCtrl.create();
    this.event=this.navParam.get("theEvent");
  }

  ionViewDidLoad() {
    this.loading.present();
    this.restangular.all('user/'+this.constante.user.id+'/operations').getList().subscribe(operations => {
      this.operations = operations;
      this.operationsComplete = operations;
      this.loading.dismiss();
    },errorResponse => {
      console.log("Error with status code", errorResponse.status);
      this.loading.dismiss();

    });
  }
  choose(operation: Operation) {
    // Sauvegarde du lien!!!
    this.viewCtrl.dismiss(operation);
  }
  dismiss() {
    this.viewCtrl.dismiss();
  }

  filtreOperation(ev) {
    console.log('Filtre');
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.operations = this.operationsComplete.filter((item) => {
        return (JSON.stringify(item).toLocaleLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }
}
