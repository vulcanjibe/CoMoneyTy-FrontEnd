import { Component } from '@angular/core';
import {NavController, LoadingController, ToastController } from 'ionic-angular';

import 'rxjs/Rx';


import {Message, Mouvement, Ordre} from "../cmy-model/cmy.model";
import {Restangular} from 'ngx-restangular';
import {  Constante} from '../cmy-model/cmy.model';
import {DetailMessage} from "../cmy-detail-message/cmy-detail-message";
import {DetailOrdre} from "../cmy-detail-ordre/cmy-detail-ordre";
import {PaiementOrdre} from "../cmy-paiement-ordre/cmy-paiement-ordre";

@Component({
  selector: 'liste-ordre',
  templateUrl: 'cmy-liste-ordre.html'
})
export class ListeOrdre {
  ordres: Array<Ordre>;
  loading: any;

  constructor(
    public constante:Constante,
    public loadingCtrl: LoadingController,private nav:NavController,private restangular: Restangular,private toastCtrl:ToastController
  ) {
    this.loading = this.loadingCtrl.create();
  }

  ionViewDidLoad() {
    this.loading.present();
    // This will query /accounts and return a observable.
    this.restangular.all('user/ordres').getList().subscribe(ordres => {
      this.ordres = ordres;
      this.loading.dismiss();
    },errorResponse => {
      this.constante.traiteErreur(errorResponse,this);
    });
  };

  detail(ordre:Ordre) {
    this.nav.push(DetailOrdre,{theOrdre:ordre});
  };

  traite(ordre:Ordre) {
    if(ordre.mouvement.etat=="Réalisé") {
      let toast = this.toastCtrl.create({
        message: "Le paiement a déjà été réalisé!",
        duration: 3000,
        position: 'top'
      });
      toast.present();
      return;
    }
    this.nav.push(PaiementOrdre,{theOrdre:ordre});
  };

}
