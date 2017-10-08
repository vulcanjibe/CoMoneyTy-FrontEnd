import { Component } from '@angular/core';
import {NavController, LoadingController, ToastController,ModalController, NavParams,AlertController } from 'ionic-angular';

import 'rxjs/Rx';

import {Constante, Depense, Event, OperationAvecDepense,UserAvecDepense,User} from "../cmy-model/cmy.model";

import  {DetailOperation} from "../cmy-detail-operation/cmy-detail-operation";
import {ModalChoixEvent} from '../cmy-modal/modal-choix-event';
import {Restangular} from 'ngx-restangular';
@Component({
  selector: 'liste-depense',
  templateUrl: 'cmy-liste-depense.html',
  providers:[Restangular]
})
export class ListeDepense {
  participants: Array<UserAvecDepense>;
  depenses : Array<DepenseAvecUser>;
  event: Event;
  loading: any;
  action:any;
  constructor(public nav: NavController,public constante:Constante,
    public loadingCtrl: LoadingController,private restangular: Restangular,public alertController:AlertController,   public toastCtrl: ToastController,private modalController :ModalController,public navParam:NavParams ) {
    this.loading = this.loadingCtrl.create();
    this.event = navParam.get("theEvent");
    this.participants = navParam.get("theParticipants");
  }

  ionViewDidLoad() {
    this.loading.present();
    this.restangular.all('event/'+this.event.id+'/depenses').getList().subscribe(depenses => {
      this.depenses = new Array<DepenseAvecUser>();
      for(let depense of depenses) {
        let dep:DepenseAvecUser = new DepenseAvecUser();
        dep.depense = depense;
        for(let particpant of this.participants)
        {
          if(particpant.user.id==depense.idPayeur)
          {
            dep.user=particpant.user;
            break;
          }
        }
        this.depenses.push(dep);
      }

      this.loading.dismiss();
    },errorResponse => {
      console.log("Error with status code", errorResponse.status);
      this.loading.dismiss();

    });

  };
  detail(operation:OperationAvecDepense) {
    if(operation.depense.idPayeur!=this.constante.user.id)
    {
      let toast = this.toastCtrl.create({
        message: 'Vous ne pouvez pas modifier cette dépense',
        duration: 3000,
        position: 'top'
      });
      toast.present();
      return;
    }
    const alert = this.alertController.create({
      title: 'Modifier cette dépense',
      message: "Voulez-vous :",
      buttons: [
        {
          text: 'Supprimer cette dépense',
          role: 'cancel',
          handler: () => {
            this.loading = this.loadingCtrl.create({
              content: 'Suppression...',
            });
            this.loading.present();
            // this.operationAvecDepense.depense.remove();
            let newDepense = this.restangular.copy(operation.depense);
            newDepense.route='depense';
            newDepense.remove().toPromise().then(resp=> {
              this.loading.dismissAll();
              console.log("dépense supprimée");
              this.event.montantTotal-=newDepense.montant;
             // this.constante.touchEvent(this.event); Ne sert à rien c'est bien l'event initial qui est là
              // suppression de la ligne
              for(let i=0;i<this.depenses.length;i++) {
                let dep = this.depenses[i];
                if(dep.depense.id==operation.depense.id)
                {
                  this.depenses.splice(i,1);
                  break;
                }
              }
              // Mise à jour des montant participant
              let montant =  newDepense.montant/this.participants.length;
              for(let participant of this.participants)
                if(participant.user.id!=newDepense.idPayeur)
                  participant.doit-=montant;
                else {
                  participant.aPaye -= newDepense.montant;
                  participant.doit += newDepense.montant - montant;
                }
            }, errorResponse => {
              console.log("Error with status code", errorResponse.status);
            });
          }
        },
        {
          text: 'Modifier cette dépense',
          handler: () => {

          }
        },
        {
          text: 'Ne rien faire',
          handler: () => {

          }
        }
      ]
    });
    alert.present();
  };


};

class DepenseAvecUser {
  depense: Depense;
  user: User;
}
