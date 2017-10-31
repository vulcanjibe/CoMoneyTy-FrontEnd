import { Component } from '@angular/core';
import {NavController, LoadingController, AlertController} from 'ionic-angular';

import 'rxjs/Rx';


import {Invitation, Message, Ordre, TableauMessage} from "../cmy-model/cmy.model";
import {Restangular} from 'ngx-restangular';
import {  Constante} from '../cmy-model/cmy.model';
import {DetailMessage} from "../cmy-detail-message/cmy-detail-message";
import {PaiementOrdre} from "../cmy-paiement-ordre/cmy-paiement-ordre";
import {DetailOrdre} from "../cmy-detail-ordre/cmy-detail-ordre";

@Component({
  selector: 'liste-message',
  templateUrl: 'cmy-liste-message.html'
})
export class ListeMessage {
  tableauMessages:Array<TableauMessage>;
  loading: any;

  constructor(
    public constante:Constante,
    public loadingCtrl: LoadingController,private alertCtrl:AlertController,private nav:NavController,private restangular: Restangular,private alertController:AlertController
  ) {
    this.loading = this.loadingCtrl.create();
  }

  ionViewDidLoad() {
    this.loading.present();
    // This will query /accounts and return a observable.
    this.restangular.all('user/'+this.constante.user.id+'/messages').getList().subscribe(messages => {
      this.tableauMessages = messages;
      this.loading.dismiss();
    },errorResponse => {
      this.constante.traiteErreur(errorResponse,this);
    });
  };

  traite(message:Message) {
    this.nav.push(DetailMessage, {theMessage: message})
  };


  trash(message:Message) {
    const alert = this.alertCtrl.create({
      title: 'Suppression message',
      message: 'Etes-vous sur de voulier supprimer ce message?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Confirmer',
          handler: data => {
            this.loading = this.loadingCtrl.create();
            this.loading.present();
            let mvtRest = this.restangular.copy(message);
            mvtRest.route="message";
            mvtRest.remove().toPromise().then(rep => {
              this.loading.dismissAll();
              this.constante.presentToast("Message supprimé!");
              for(let tab of this.tableauMessages)
              {
                let messages =  tab.tableau;
                let trouve = false;
                for (let i = 0; i < messages.length; i++) {
                  let msg = messages[i];
                  if (msg.id == message.id) {
                    messages.splice(i, 1);
                    trouve=true;
                    break;
                  }
                }
                if(trouve)
                  break;
              }
            },errorResponse=>{
              this.constante.traiteErreur(errorResponse,this);
            });

          }
        }
      ]
    });
    alert.present();
  };
}
