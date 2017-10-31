import { Component } from '@angular/core';
import {NavController, LoadingController, ToastController,ModalController } from 'ionic-angular';

import 'rxjs/Rx';

import {
  Constante, Depense, Operation, TypeOperation, OperationAvecDepense,
  TableauOperation
} from "../cmy-model/cmy.model";

import  {DetailOperation} from "../cmy-detail-operation/cmy-detail-operation";
import {ModalChoixEvent} from '../cmy-modal/modal-choix-event';
import {Restangular} from 'ngx-restangular';
@Component({
  selector: 'liste-operation',
  templateUrl: 'cmy-liste-operation.html',
  providers:[Restangular]
})
export class ListeOperation {
  tableauOperations:Array<TableauOperation>;
  tableauOperationsInitial:Array<TableauOperation>;
  loading: any;
  action:any;
  numero:number;
  peopleByCountry: any[] = [{'pays':'fr', 'people' : [ {'name':'totot'},{'name':'totot2'},{'name':'totot3'}]},{'pays':'gb', 'people' : [ {'name':'tototgg'},{'name':'tgogtgot2'},{'name':'tgggotot3'}]}]
  constructor(public nav: NavController,public constante:Constante,
    public loadingCtrl: LoadingController,private restangular: Restangular,   public toastCtrl: ToastController,private modalController :ModalController ) {
    this.loading = this.loadingCtrl.create();
    this.action={'encours':false};
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
    if(operationAvecDepense.operation.montant>0)
    {
      let toast = this.toastCtrl.create({
        message: "Merci de sélectionner un débit uniquement!",
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
            this.constante.traiteErreur(errorResponse,this);
            this.action.encours=false;
          });

        });
        modal.present();

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

