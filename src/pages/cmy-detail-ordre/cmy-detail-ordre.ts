import { Component } from '@angular/core';
import {NavController, NavParams,LoadingController} from 'ionic-angular';

import 'rxjs/Rx';

import {Constante,  Ordre} from "../cmy-model/cmy.model";

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
    public navParams: NavParams, public loadingCtrl: LoadingController ) {
    this.ordre = this.navParams.get("theOrdre");
    this.loading = this.loadingCtrl.create();
  }

  ionViewDidLoad() {

  }


}
