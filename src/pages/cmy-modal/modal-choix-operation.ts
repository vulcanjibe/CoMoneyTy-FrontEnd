import { Component } from '@angular/core';

import {LoadingController, ViewController, NavParams, ToastController} from 'ionic-angular';

import {Constante, Operation, OperationAvecDepense, TableauOperation} from '../cmy-model/cmy.model';
import {Restangular} from 'ngx-restangular';
@Component({
  selector: 'modal-choix-operation',
  templateUrl: 'modal-choix-operation.html'
})
export class ModalChoixOperation {
  loading: any;

  tableauOperations:Array<TableauOperation>;
  tableauOperationsInitial:Array<TableauOperation>;
  event:Event;
  constructor(
    public loadingCtrl: LoadingController,
    public constante:Constante,
    public viewCtrl: ViewController,
    private restangular: Restangular,
    private navParam:NavParams,   public toastCtrl: ToastController
  ) {
    this.loading = this.loadingCtrl.create();
    this.event=this.navParam.get("theEvent");
  }

  ionViewDidLoad() {
    this.loading.present();
    this.restangular.all('user/'+this.constante.user.id+'/operations').getList().subscribe(operations => {
      this.tableauOperations = operations;
      this.tableauOperationsInitial = operations;
      this.loading.dismiss();
    },errorResponse => {
      this.loading.dismiss();
      this.constante.traiteErreur(errorResponse,this);
    });
  };
  choose(operationAvecDepense: OperationAvecDepense) {
    // Sauvegarde du lien!!!
    if(operationAvecDepense.operation.montant>0)
    {
      let toast = this.toastCtrl.create({
        message: "Merci de sélectionner un débit uniquement!",
        duration: 3000,
        position: 'top'
      });
      toast.present();
      return;
    }
    if(operationAvecDepense.depense!=null)
    {
      let toast = this.toastCtrl.create({
        message: "Opération déjà utilisée!",
        duration: 3000,
        position: 'top'
      });
      toast.present();
      return;
    }
    this.viewCtrl.dismiss(operationAvecDepense);
  };
  dismiss() {
    this.viewCtrl.dismiss();
  };

  filtreOperation(ev) {
    console.log('Filtre');
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.tableauOperations = this.tableauOperationsInitial.filter((item) => {
        return (JSON.stringify(item).toLocaleLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    } else {
      this.tableauOperations = this.tableauOperationsInitial;
    }
  };
};
