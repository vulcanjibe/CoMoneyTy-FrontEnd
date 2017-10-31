import { Component } from '@angular/core';
import {NavController, NavParams,LoadingController,AlertController} from 'ionic-angular';

import 'rxjs/Rx';

import {Constante, Event,Depense, Operation, TypeOperation,OperationAvecDepense} from "../cmy-model/cmy.model";

import {ModalChoixEvent} from '../cmy-modal/modal-choix-event';
import {Restangular} from 'ngx-restangular';
@Component({
  selector: 'detail-operation',
  templateUrl: 'cmy-detail-operation.html',
  providers:[Restangular]
})
export class DetailOperation {
  operationAvecDepense:OperationAvecDepense;
  event:Event;
  loading: any;
  dejaLance:any;
  constructor(public nav: NavController,public constante:Constante,
    public navParams: NavParams, public loadingCtrl: LoadingController,private alertController:AlertController,private restangular: Restangular ) {
    this.operationAvecDepense = this.navParams.get("theOperation");
    this.dejaLance = this.navParams.get("action");
    this.loading = this.loadingCtrl.create();
  }

  ionViewDidLoad() {

    if(this.operationAvecDepense.depense!=null) {
      this.loading.present();

      // This will query /accounts and return a observable.
      this.restangular.one('event/' + this.operationAvecDepense.depense.idEvent).doGET().subscribe(event => {
        this.event = event;
        this.loading.dismiss();
      }, errorResponse => {
        this.constante.traiteErreur(errorResponse,this);
      });
    }
  }

  ionViewWillLeave() {
    this.dejaLance.encours=false;
  };

  supprimeLien()
  {
    const alert = this.alertController.create({
      title: 'Confirmer la suppression',
      message: "Vous voulez retirer cette opération de l'event?",
      buttons: [
        {
          text: 'Non',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Oui',
          handler: () => {
            // suppression du lien
            console.log('OK clicked');
            this.loading = this.loadingCtrl.create({
              content: 'Suppression...',
            });
            this.loading.present();
           // this.operationAvecDepense.depense.remove();
            let newDepense = this.restangular.copy(this.operationAvecDepense.depense);
            newDepense.route='depense';
            newDepense.remove().toPromise().then(resp=> {
              this.loading.dismissAll();
              console.log("dépense supprimée");
              this.operationAvecDepense.depense=null;
              this.event=null;
            }, errorResponse => {
              this.constante.traiteErreur(errorResponse,this);
            });

          }
        }
      ]
    });
    alert.present();
  };
}
