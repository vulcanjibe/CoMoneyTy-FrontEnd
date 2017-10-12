import { Component } from '@angular/core';
import {NavController, LoadingController, ToastController,ModalController, NavParams,AlertController } from 'ionic-angular';

import 'rxjs/Rx';

import {
  Constante, Depense, Event, OperationAvecDepense, UserAvecDepense, User,
  Mouvement
} from "../cmy-model/cmy.model";

import  {DetailOperation} from "../cmy-detail-operation/cmy-detail-operation";
import {ModalChoixEvent} from '../cmy-modal/modal-choix-event';
import {Restangular} from 'ngx-restangular';
@Component({
  selector: 'bilan-event',
  templateUrl: 'cmy-bilan-event.html',
  providers:[Restangular]
})
export class BilanEvent {
  event: Event;
  mouvements:Array<MouvementAvecUser>;
  participants: Array<UserAvecDepense>;
  loading: any;
  constructor(public nav: NavController,public constante:Constante,
    public loadingCtrl: LoadingController,private restangular: Restangular,public alertController:AlertController,   public toastCtrl: ToastController,private modalController :ModalController,public navParam:NavParams ) {
    this.loading = this.loadingCtrl.create();
    this.event = navParam.get("theEvent");
    this.participants = navParam.get("theParticipants");
  }

  ionViewDidLoad() {
    this.loading.present();
    this.restangular.all('event/'+this.event.id+'/bilan').getList().subscribe(mouvements => {
      this.mouvements = new Array<MouvementAvecUser>();
      for(let mouvement of mouvements) {
          let user1 = this.rechercheUser(mouvement.idEmetteur);
          let user2 = this.rechercheUser(mouvement.idDestinataire);
          let mvt = new MouvementAvecUser();
          mvt.mouvement=mouvement;
          mvt.userSource=user1;
          mvt.userCible=user2;
          this.mouvements.push(mvt);
      }
      this.loading.dismiss();
    },errorResponse => {
      this.loading.dismiss();
      this.constante.traiteErreur(errorResponse,this);
    });

  };

  rechercheUser(id:string)
  {
    for(let user of this.participants)
    {
      if(user.user.id==id)
        return user.user;
    }
  }

}

class MouvementAvecUser {
  mouvement:Mouvement;
  userSource:User;
  userCible:User;
}
