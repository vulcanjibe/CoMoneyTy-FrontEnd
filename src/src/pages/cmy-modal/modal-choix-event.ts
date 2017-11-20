import { Component } from '@angular/core';

import {  LoadingController ,ViewController} from 'ionic-angular';

import {  Constante} from '../cmy-model/cmy.model';
import {Restangular} from 'ngx-restangular';
@Component({
  templateUrl: 'modal-choix-event.html'
})
export class ModalChoixEvent {
  loading: any;
  events:Array<Event>;
  constructor(
    public loadingCtrl: LoadingController,
    public constante:Constante,
    public viewCtrl: ViewController,
    private restangular: Restangular
  ) {
    this.loading = this.loadingCtrl.create();
  }

  ionViewDidLoad() {
    this.loading.present();
    this.restangular.all('user/'+this.constante.user.id+'/events').getList().subscribe(events => {
      this.events = events;
      this.loading.dismiss();
    },errorResponse => {
      this.loading.dismiss();
      this.constante.traiteErreur(errorResponse,this);
    });
  }
  choose(event: Event) {
    // Sauvegarde du lien!!!
    this.viewCtrl.dismiss(event);
  }
  dismiss() {
    this.viewCtrl.dismiss();
  }
}
