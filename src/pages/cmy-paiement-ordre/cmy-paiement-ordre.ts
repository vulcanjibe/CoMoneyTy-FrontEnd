import {Component} from '@angular/core';
import {AlertController, LoadingController, NavController, NavParams, ToastController} from 'ionic-angular';
import {Constante, Message, Ordre} from "../cmy-model/cmy.model";
import {Restangular} from 'ngx-restangular';
import {PayPal, PayPalConfiguration, PayPalPayment} from "@ionic-native/paypal";

//import 'rxjs/Rx';
@Component({
  selector: 'paiement-ordre',
  templateUrl: 'cmy-paiement-ordre.html',
  providers:[Restangular]
})
export class PaiementOrdre {
  ordre:Ordre;
  message:Message;
  loading: any;
  constructor(public nav: NavController,public constante:Constante,
    public navParams: NavParams, public loadingCtrl: LoadingController,private alertController:AlertController,private toastCtrl:ToastController,private restangular: Restangular,private payPal:PayPal ) {
    this.ordre = this.navParams.get("theOrdre");
    this.message = this.navParams.get("theMessage");
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

  virement() {
    const alert = this.alertController.create({
      title: 'Valider le virement?',
      message: "Confirmez-vous que vous voulez régler par virement?",
      buttons: [
        {
          text: 'Oui',
          role: 'cancel',
          handler: () => {
            // On bascule juste le mouvement en "effectué"
            this.loading.present();
            let aOrdre = new Ordre();
            this.ordre.mouvement.etat="Réalisé";
            aOrdre.mouvement=this.ordre.mouvement;
            aOrdre.emetteur=this.ordre.emetteur;
            aOrdre.event=this.ordre.event;
            this.restangular.one("mouvement").post("reglementParVirement",aOrdre).subscribe(rep =>{
              this.loading.dismissAll();
              this.presentToast("Virement transmis");
              this.message.actionRealise = true;
              let msgRest = this.restangular.copy(this.message);
              msgRest.route="message";
              msgRest.save().toPromise().then(rep=>{
                console.log("Message action réalisée!");
              },error=>{
                this.constante.traiteErreur(error,this);
              })
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
  hand() {
    const alert = this.alertController.create({
      title: 'Valider le réglèment manuel?',
      message: "Confirmez-vous que vous avez régler en espèce ce paiement?",
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
              this.presentToast("Paiement enregistré");
              this.message.actionRealise = true;
              let msgRest = this.restangular.copy(this.message);
              msgRest.route="message";
              msgRest.save().toPromise().then(rep=>{
                console.log("Message action réalisée!");
              },error=>{
                this.constante.traiteErreur(error,this);
              })
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
