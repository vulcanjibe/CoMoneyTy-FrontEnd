import {Component, ElementRef, ViewChild} from '@angular/core';
import {NavController, LoadingController, AlertController, NavParams} from 'ionic-angular';

import 'rxjs/Rx';

import {Event, Constante, Historique} from '../cmy-model/cmy.model';
import {DetailEventPage} from '../cmy-detail-event/cmy-detail-event';
import {CreationEventPage} from '../cmy-creation-event/cmy-creation-event';
import {Restangular} from 'ngx-restangular';
import {MenuCircular,SousMenu} from "../../components/menu-circular/menu-circular";
@Component({
  selector: 'liste-historique',
  templateUrl: 'cmy-liste-historique.html',
  providers:[Restangular]
})
export class ListeHistorique {
  historiques: Array<Historique>;
  event:Event;
  loading: any;

  constructor(public nav: NavController,public constante:Constante,
    public loadingCtrl: LoadingController,public navParams: NavParams, public alertCtrl: AlertController,private restangular: Restangular,private alertController:AlertController) {
    this.loading = this.loadingCtrl.create();
    this.event = this.navParams.get("theEvent");
  };


  ionViewDidLoad() {
    this.loading.present();
    // This will query /accounts and return a observable.
    this.restangular.all('event/'+this.event.id+'/historique').getList().subscribe(histo => {
      console.log(histo);
      this.historiques = histo;
      this.loading.dismissAll();
    },errorResponse => {
      this.constante.traiteErreur(errorResponse,this);
    });


  }


}
