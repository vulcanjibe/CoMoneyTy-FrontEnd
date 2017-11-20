import { Component } from '@angular/core';

import 'rxjs/Rx';



import {Restangular} from 'ngx-restangular';
import {AlertController, LoadingController, NavController, ToastController} from "ionic-angular";
import {Constante} from "../cmy-model/cmy.model";
import {GestionAmi} from "../cmy-gestion-ami/cmy-gestion-ami";
import {ListeEvent} from "../cmy-liste-event/cmy-liste-event";
import {ListeMessage} from "../cmy-list-message/cmy-liste-message";
import {GestionProfile} from "../cmy-gestion-profile/cmy-gestion-profile";


@Component({
  selector: 'home',
  templateUrl: 'cmy-home.html',
  providers:[Restangular]
})
export class Home {
  loading: any;
  montantQueJeDois: number=0;
  nbEvent: number=0;
  montantQuonMeDoit: number=0;
  nbMessageATraiter: number=0;
  nbAmis:number=0;
  profil:string="--";
  profilColor:string;
  constructor(public nav: NavController,public constante:Constante, public loadingCtrl: LoadingController,private restangular:Restangular,private alertController:AlertController,private toastCtrl:ToastController) {

  };

  ionViewDidLoad() {
    this.restangular.one("user/"+this.constante.user.id+"/synthese").get().toPromise().then(rep=>{
      this.montantQueJeDois=rep.montantQueJeDois;
      this.nbEvent=rep.nbEvent;
      this.montantQuonMeDoit=rep.montantQuonMeDoit;
      this.nbMessageATraiter=rep.nbMessageATraiter;
      this.nbAmis=rep.nbAmis;
      this.profil=(rep.profil>0?"complet":"incomplet");
      this.profilColor=(rep.profil>0?"secondary":"danger");

      if(this.constante.user==null && this.constante.user==null) {
        const alert = this.alertController.create({
          title: 'Votre profil est incomplet (Téléphone!)',
          message: "Voulez-vous accéder directement à votre profil pour le compléter?",
          buttons: [
            {
              text: 'Oui',
              role: 'cancel',
              handler: () => {
                this.nav.push(GestionProfile);

              }
            },
            {
              text: 'Non',
              handler: () => {

              }
            }

          ]
        });
        alert.present();
      }

    },error=>{
      this.constante.traiteErreur(error,this);
    })
  };



  goToAmis() {
    this.nav.setRoot(GestionAmi);
  };

  goToProfile() {
    this.nav.push(GestionProfile);
  };

  goToEvent() {
    this.nav.setRoot(ListeEvent);
  };
  goToMessage() {
    this.nav.setRoot(ListeMessage);
  };


}
