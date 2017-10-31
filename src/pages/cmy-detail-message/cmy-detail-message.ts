import { Component } from '@angular/core';
import {NavController, NavParams,LoadingController,AlertController} from 'ionic-angular';

import 'rxjs/Rx';

import {Constante, Invitation, Message, Ordre} from "../cmy-model/cmy.model";


import {Restangular} from 'ngx-restangular';
import {PaiementOrdre} from "../cmy-paiement-ordre/cmy-paiement-ordre";
import {DetailOrdre} from "../cmy-detail-ordre/cmy-detail-ordre";
@Component({
  selector: 'detail-message',
  templateUrl: 'cmy-detail-message.html',
  providers:[Restangular]
})
export class DetailMessage {
  message:Message;
  loading:any;
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

    };


  traite() {
      let message:Message = this.message;
      let messageCache = JSON.parse(message.messageCache);
      if (messageCache.nomClasse == "Invitation") {
        // C'est une invitation
        let invitation: Invitation = messageCache;
        if (invitation.etatReponse == "Invitation envoyée") {
          this.traiteInvitation(message, invitation);
        } else {
          this.constante.presentToast("Invitation déjà acceptée!");
        }
      } else if (messageCache.nomClasse == "Ordre") {
        // On est sur un mouvement => On renvoie sur l'ordre
        let ordre: Ordre = messageCache;
        if (!message.actionRealise)
          this.nav.push(PaiementOrdre, {theOrdre: ordre,theMessage: message});
        else {
          ordre.mouvement.etat="Réalisé";
          this.nav.push(DetailOrdre, {theOrdre: ordre});
        }
      }
    };

  traiteInvitation(message:Message,invitation:Invitation) {
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
            //let messageCache: Message = JSON.parse(message.messageCache);
            this.restangular.one("invitation/" + invitation.id + "/confirm").get().subscribe(resp => {
              console.log("OK!");
              this.loading.dismissAll();
              message.dejaLu = true;
              message.actionRealise = true;
              let msgRest = this.restangular.copy(this.message);
              msgRest.route="message";
              msgRest.save().toPromise().then(rep=>{
                console.log("Message action réalisée!");
              },error=>{
                this.constante.traiteErreur(error,this);
              })
            }, errorResponse => {
              this.constante.traiteErreur(errorResponse, this);
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
  };
}
