import { Component } from '@angular/core';
import {NavController, LoadingController, ToastController,ModalController, NavParams,AlertController } from 'ionic-angular';

import 'rxjs/Rx';

import {
  Constante, Depense, Event, OperationAvecDepense, UserAvecDepense, User,
  Mouvement, Message
} from "../cmy-model/cmy.model";

import  {DetailOperation} from "../cmy-detail-operation/cmy-detail-operation";
import {ModalChoixEvent} from '../cmy-modal/modal-choix-event';
import {Restangular} from 'ngx-restangular';
import {SMS} from "@ionic-native/sms";
@Component({
  selector: 'bilan-event',
  templateUrl: 'cmy-bilan-event.html',
  providers:[Restangular]
})
export class BilanEvent {
  event: Event;
  mouvements:Array<MouvementAvecUser>;
  participants: Array<UserAvecDepense>;
  loading: any;
  categories_checkbox_open: boolean;
  categories_checkbox_result;
  constructor(public nav: NavController,public constante:Constante,
    public loadingCtrl: LoadingController,public alertCtrl: AlertController,private smsProvider:SMS,private restangular: Restangular,public alertController:AlertController,   public toastCtrl: ToastController,private modalController :ModalController,public navParam:NavParams ) {
    this.loading = this.loadingCtrl.create();
    this.event = navParam.get("theEvent");
    this.participants = navParam.get("theParticipants");
  }

  ionViewDidLoad() {
    this.loading.present();
    this.restangular.all('event/'+this.event.id+'/bilan').getList().subscribe(mouvements => {
      this.mouvements = new Array<MouvementAvecUser>();
      for(let mouvement of mouvements) {
          let user1 = this.rechercheUser(mouvement.idEmetteur);
          let user2 = this.rechercheUser(mouvement.idDestinataire);
          let mvt = new MouvementAvecUser();
          mvt.mouvement=mouvement;
          mvt.userSource=user1;
          mvt.userCible=user2;
          this.mouvements.push(mvt);
      }
      this.loading.dismissAll();
    },errorResponse => {
      this.loading.dismissAll();
      this.constante.traiteErreur(errorResponse,this);
    });

  };

  rechercheUser(id:string)
  {
    for(let user of this.participants)
    {
      if(user.user.id==id)
        return user.user;
    }
  }

  solderEvent() {
    if(this.event.roles.indexOf("Createur")<0)
    {
      this.constante.presentToast("Seul le créateur peut solder l'event!");
      return;
    };
    this.loading = this.loadingCtrl.create({
      content: 'Enregistrement...',
    });
    this.loading.present();
    this.restangular.one('event/'+this.event.id+'/validebilan').get().subscribe(mouvements => {
        this.loading.dismissAll();
        this.event.etat="En cours de solde";
        this.presentToast("Les ordres de paiement ont été envoyés!");
    },errorResponse => {
      this.loading.dismissAll();
      this.constante.traiteErreur(errorResponse,this);
    });

    };
  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  };

  EnvoyerSms() {
    this.chooseCategory();
  };


  chooseCategory(){
    let alert = this.alertCtrl.create({
      cssClass: 'category-prompt'
    });
    alert.setTitle('Communication');

    alert.addInput({
      type: 'checkbox',
      label: 'Par SMS',
      value: 'sms',
      checked: true
    });

    alert.addInput({
      type: 'checkbox',
      label: 'Par mail',
      value: 'mail'
    });
    alert.addInput({
      type: 'checkbox',
      label: 'Par message CoMoneyty',
      value: 'message'
    });
    alert.addButton('Annule');
    alert.addButton({
      text: 'OK',
      handler: data => {
        console.log('Checkbox data:', data);
        let tab = new Array();
        this.categories_checkbox_open = false;
        this.categories_checkbox_result = data;
        if(data.indexOf("sms")!=-1) {
          tab.push(this.sms());
        }
        if(data.indexOf("message")!=-1) {
          tab.push(this.messageCoMoneyTy());
        }

        if(data.indexOf("mail")!=-1) {

        }

        this.loading = this.loadingCtrl.create({
          content: 'Envoi message...',
        });
        this.loading.present();
        Promise.all(tab).then(rep=>{
          this.loading.dismissAll();
          this.presentToast("Messages envoyés!");
        },errorResponse=>{
          this.loading.dismissAll();
          this.constante.traiteErreur(errorResponse,this);
        })  ;

      }
    });
    alert.present().then(() => {
      this.categories_checkbox_open = true;
    });
  };

  sms() {
    console.log("SMS!");
    let options = {
      replaceLineBreaks: false,
      android : {
        intent: ''
      }
    };
    let tabSMS =new Array();
    for(let mouvement of this.mouvements) {
      let phone = mouvement.userSource.phone;
      if(phone==null)
        continue;
      phone=phone.replace(" ","");
      tabSMS.push(this.smsProvider.send(phone,'Salut '+mouvement.userSource.prenom+'! Tu dois '+mouvement.mouvement.montant+'€ à '+mouvement.userCible.prenom+" pour l'event "+this.event.libelle+" du "+this.event.date,options));
    }
    return Promise.all(tabSMS);

  };

  messageCoMoneyTy() {
    console.log("message!");
    let tabSMS =new Array();
    for(let mouvement of this.mouvements) {
      let message = new Message();
      message.emetteur=mouvement.userCible;
      message.destinataire=mouvement.userSource;
      message.date=new Date();
      message.titre="Tu dois de l'argent!!!";
      message.message='Salut '+mouvement.userSource.prenom+'! Tu dois '+mouvement.mouvement.montant+'€ à '+mouvement.userCible.prenom+" pour l'event "+this.event.libelle+" du "+this.event.date;
      message.dejaLu=false;
      let messageRest = this.restangular.copy(message);
      messageRest.route="message";
      tabSMS.push(messageRest.save().toPromise());
    }
    return Promise.all(tabSMS);

  };

};
class MouvementAvecUser {
  mouvement:Mouvement;
  userSource:User;
  userCible:User;
}
