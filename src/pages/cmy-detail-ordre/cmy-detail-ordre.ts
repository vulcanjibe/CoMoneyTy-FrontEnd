import { Component } from '@angular/core';
import {NavController, NavParams,LoadingController,AlertController} from 'ionic-angular';

import 'rxjs/Rx';

import {Constante, Event, Depense, Operation, TypeOperation, OperationAvecDepense, Ordre} from "../cmy-model/cmy.model";

import {ModalChoixEvent} from '../cmy-modal/modal-choix-event';
import {Restangular} from 'ngx-restangular';
@Component({
  selector: 'detail-ordre',
  templateUrl: 'cmy-detail-ordre.html',
  providers:[Restangular]
})
export class DetailOrdre {
  ordre:Ordre;
  loading: any;
  constructor(public nav: NavController,public constante:Constante,
    public navParams: NavParams, public loadingCtrl: LoadingController,private alertController:AlertController,private restangular: Restangular ) {
    this.ordre = this.navParams.get("theOrdre");
    this.loading = this.loadingCtrl.create();
  }

  ionViewDidLoad() {

  }


}
