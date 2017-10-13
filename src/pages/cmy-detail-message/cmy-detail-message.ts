import { Component } from '@angular/core';
import {NavController, NavParams,LoadingController,AlertController} from 'ionic-angular';

import 'rxjs/Rx';

import {Constante, Message} from "../cmy-model/cmy.model";


import {Restangular} from 'ngx-restangular';
@Component({
  selector: 'detail-message',
  templateUrl: 'cmy-detail-message.html',
  providers:[Restangular]
})
export class DetailMessage {
  message:Message;
  constructor(public nav: NavController,public constante:Constante,
    public navParams: NavParams, public loadingCtrl: LoadingController,private alertController:AlertController,private restangular: Restangular ) {
    this.message = this.navParams.get("theMessage");
  }

  ionViewDidLoad() {


      this.message.dejaLu=true;
      let msgRest = this.restangular.copy(this.message);
      msgRest.route="message";
      msgRest.save().toPromise().then(rep=>{
        console.log("Message bascule en lu");
      },error=>{
        this.constante.traiteErreur(error,this);
      })

    }



}
