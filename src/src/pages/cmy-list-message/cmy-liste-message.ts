import { Component } from '@angular/core';
import {NavController, LoadingController, AlertController} from 'ionic-angular';

import 'rxjs/Rx';


import {Message} from "../cmy-model/cmy.model";
import {Restangular} from 'ngx-restangular';
import {  Constante} from '../cmy-model/cmy.model';
import {DetailMessage} from "../cmy-detail-message/cmy-detail-message";

@Component({
  selector: 'liste-message',
  templateUrl: 'cmy-liste-message.html'
})
export class ListeMessage {
  messages: Array<Message>;
  loading: any;

  constructor(
    public constante:Constante,
    public loadingCtrl: LoadingController,private nav:NavController,private restangular: Restangular,private alertController:AlertController
  ) {
    this.loading = this.loadingCtrl.create();
  }

  ionViewDidLoad() {
    this.loading.present();
    // This will query /accounts and return a observable.
    this.restangular.all('user/'+this.constante.user.id+'/messages').getList().subscribe(messages => {
      this.messages = messages;
      this.loading.dismiss();
    },errorResponse => {
      this.constante.traiteErreur(errorResponse,this);
    });
  }

  traite(message:Message) {


      if(message.message.startsWith("Invitation de") && message.message.endsWith("attente...") && !message.dejaLu)
      {
        // C'est une invitation
        const alert = this.alertController.create({
          title: 'Accepter une invitation',
          message: "Confirmez-vous cette invitation",
          buttons: [
            {
              text: 'Oui',
              role: 'cancel',
              handler: () => {
                // Transofrmation de l'invit en relation
                this.loading = this.loadingCtrl.create();
                this.loading.present();
                this.restangular.one("invitation/"+message.messageCache+"/confirm").get().subscribe(resp => {
                  console.log("OK!");
                  this.loading.dismissAll();
                  message.dejaLu=true;
                }, errorResponse => {
                  this.constante.traiteErreur(errorResponse,this);
                });
              }
            },
            {
              text: 'Non',
              handler: () => {
                console.log("Abandon");
              }
            }

          ]
        });
        alert.present();
      } else {
        this.nav.push(DetailMessage,{theMessage:message});
      }
    }

}
