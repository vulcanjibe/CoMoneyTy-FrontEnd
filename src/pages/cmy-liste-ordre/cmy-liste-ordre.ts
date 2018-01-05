import {Component} from '@angular/core';
import {LoadingController, NavController, ToastController} from 'ionic-angular';
import {Constante, Ordre} from "../cmy-model/cmy.model";
import {Restangular} from 'ngx-restangular';
import {DetailOrdre} from "../cmy-detail-ordre/cmy-detail-ordre";
import {PaiementOrdre} from "../cmy-paiement-ordre/cmy-paiement-ordre";

//import 'rxjs/Rx';

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
