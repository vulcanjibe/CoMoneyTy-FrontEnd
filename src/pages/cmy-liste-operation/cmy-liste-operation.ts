import { Component } from '@angular/core';
import {NavController, LoadingController, ToastController,ModalController } from 'ionic-angular';

import 'rxjs/Rx';

import {Constante, Depense, Operation, TypeOperation,OperationAvecDepense} from "../cmy-model/cmy.model";

import  {DetailOperation} from "../cmy-detail-operation/cmy-detail-operation";
import {ModalChoixEvent} from '../cmy-modal/modal-choix-event';
import {Restangular} from 'ngx-restangular';
@Component({
  selector: 'liste-operation',
  templateUrl: 'cmy-liste-operation.html',
  providers:[Restangular]
})
export class ListeOperation {
  operations:Array<OperationAvecDepense>;
  loading: any;
  action:any;
  constructor(public nav: NavController,public constante:Constante,
    public loadingCtrl: LoadingController,private restangular: Restangular,   public toastCtrl: ToastController,private modalController :ModalController ) {
    this.loading = this.loadingCtrl.create();
    this.action={'encours':false};
  }

  ionViewDidLoad() {
    this.loading.present();
    this.restangular.all('user/'+this.constante.user.id+'/operations').getList().subscribe(operations => {
      this.operations = operations;
      this.loading.dismiss();
    },errorResponse => {
      console.log("Error with status code", errorResponse.status);
      this.loading.dismiss();

    });

  };
  detail(operation:OperationAvecDepense) {
    console.log('tap...');
    if(this.action.encours) {
      return;
    }
    this.action={'encours':true};
    console.log('tap ok');
    this.nav.push(DetailOperation,{theOperation:operation,action:this.action});
  };


  transfert(operationAvecDepense:OperationAvecDepense) {
    console.log("press...");
    if(this.action.encours) {
      return;
    }
    this.action={'encours':true};
    console.log("press ok");

       if(operationAvecDepense.depense!=null)
        {
          let toast = this.toastCtrl.create({
            message: "Opération déjà utilisée!",
            duration: 3000,
            position: 'top'
          });
          toast.present();
          console.log("return transfert");
          this.action.encours=false;
          return;
        }
        let operation = operationAvecDepense.operation;
        let modal = this.modalController.create(ModalChoixEvent);
        modal.onDidDismiss(event => {
          if(event==null) {
            this.action.encours=false;
            return;
          }
          this.loading = this.loadingCtrl.create({
            content: 'Enregistrement...',
          });
          this.loading.present();

          let depense = new Depense(this.constante.user.id,event.id);
          depense.idOperation=operation.id;
          depense.montant=-operation.montant;
          depense.commentaire=operation.description;
          depense.date=operation.date;
          this.restangular.one("depense").post("save",depense).subscribe(resp => {
            // Ajout à la liste
            this.loading.dismissAll();
            console.log("dépense sauvée");
            this.action.encours=false;
            depense.id=resp.id;
            operationAvecDepense.depense=depense;

          }, errorResponse => {
            console.log("Error with status code", errorResponse.status);
            this.action.encours=false;

          });

        });
        modal.present();

  };

};
