import { Component } from '@angular/core';
import {NavController, NavParams, LoadingController, AlertController, ToastController} from 'ionic-angular';

import 'rxjs/Rx';

import {Constante, Event, Depense, Operation, TypeOperation, OperationAvecDepense, Ordre} from "../cmy-model/cmy.model";

import {ModalChoixEvent} from '../cmy-modal/modal-choix-event';
import {Restangular} from 'ngx-restangular';
import {PayPal, PayPalConfiguration, PayPalPayment} from "@ionic-native/paypal";
@Component({
  selector: 'paiement-ordre',
  templateUrl: 'cmy-paiement-ordre.html',
  providers:[Restangular]
})
export class PaiementOrdre {
  ordre:Ordre;
  loading: any;
  constructor(public nav: NavController,public constante:Constante,
    public navParams: NavParams, public loadingCtrl: LoadingController,private alertController:AlertController,private toastCtrl:ToastController,private restangular: Restangular,private payPal:PayPal ) {
    this.ordre = this.navParams.get("theOrdre");
    this.loading = this.loadingCtrl.create();
  }

  ionViewDidLoad() {

  }

  paypal() {
    this.payPal.init({
      PayPalEnvironmentProduction: 'YOUR_PRODUCTION_CLIENT_ID',
      PayPalEnvironmentSandbox: 'AcVJLzisnjYYATxnMjyM3msePtk6TV-_za3cPUlJRgPaEM-fOQmgx7m_jHDC-ceYhzJOK1b8W3boq5a-'
    }).then(res => {
      this.payPal.prepareToRender('PayPalEnvironmentSandbox', new PayPalConfiguration({
        // Only needed if you get an "Internal Service Error" after PayPal login!
        //payPalShippingAddressOption: 2 // PayPalShippingAddressOptionPayPal

      })).then(() => {
        let payment = new PayPalPayment(''+this.ordre.mouvement.montant, 'EUR', 'Description', 'sale');
        this.payPal.renderSinglePaymentUI(payment).then(rep => {
          // Successfully paid
          console.log(rep);
        }, error => {
           this.constante.traiteErreur(error,this);
        });
      }, error => {
         this.constante.traiteErreur(error,this);
      });
    }, error => {
       this.constante.traiteErreur(error,this);
    });
  }

  visa() {
    this.presentToast("Le paiement VISA n'est pas encore disponible!");
  }

  hand() {
    const alert = this.alertController.create({
      title: 'Valider le réglèment manuel?',
      message: "Confirmez-vous que vous avez régler en espèce ce paiment",
      buttons: [
        {
          text: 'Oui',
          role: 'cancel',
          handler: () => {
            // On bascule juste le mouvement en "effectué"
            this.loading.present();
            this.ordre.mouvement.etat="Réalisé";
            let mvtRest = this.restangular.copy(this.ordre.mouvement);
            mvtRest.route="mouvement";
            mvtRest.save().toPromise().then(rep =>{
              this.loading.dismissAll();
            },error=>{
              this.constante.traiteErreur(error,this);
            })

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
  }

  lydia() {
    this.presentToast("Le paiement Lydia n'est pas encore disponible!");
  }
  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }
}
