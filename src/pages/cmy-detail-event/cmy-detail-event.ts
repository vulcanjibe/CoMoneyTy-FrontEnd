import { Component } from '@angular/core';
import { NavController, LoadingController,NavParams,ModalController } from 'ionic-angular';
import { SMS} from '@ionic-native/sms';

import 'rxjs/Rx';

import { Event,UserAvecDepense,Constante ,Depense} from '../cmy-model/cmy.model';
import { AjoutParticipantPage } from '../cmy-ajout-participant/cmy-ajout-participant'
import {Restangular} from 'ngx-restangular';
import {CreationMouvementPage} from "../cmy-creation-mouvement/cmy-creation-mouvement";
import {ModalChoixOperation} from "../cmy-modal/modal-choix-operation";
import {ListeDepense} from "../cmy-liste-depense/cmy-liste-depense";
@Component({
  selector: 'detail-event-page',
  templateUrl: 'cmy-detail-event.html',
  providers:[Restangular]
})
export class DetailEventPage {
  event: Event;
  participants: Array<UserAvecDepense>;
  loading: any;

  constructor(public nav: NavController,
    public loadingCtrl: LoadingController,public constante:Constante,private restangular: Restangular,public navParams: NavParams,private modalController:ModalController,private smsProvider:SMS) {
    this.loading = this.loadingCtrl.create();
    this.event = navParams.get("theEvent");
  }

  ionViewDidLoad() {
    this.loading.present();

    // Lecture des participants de cet event
    this.restangular.all('event/'+this.event.id+'/users').getList().subscribe(particpants => {
      this.participants = particpants;
      this.loading.dismiss();
    }, errorResponse => {
      console.log("Error with status code", errorResponse.status);
    });

  }

  addNewParticipant() {
    console.log("Creation Event!");
   this.nav.push(AjoutParticipantPage,{theEvent:this.event,participantsEvent: this.participants}).then(end=>{
     console.log("eeeeeee");
   });

  }
  rechercheOperation() {
    let modal = this.modalController.create(ModalChoixOperation,{'theEvent':this.event});
    modal.onDidDismiss(operationAvecDepense => {
      if(operationAvecDepense==null)
        return;
      this.loading = this.loadingCtrl.create({
        content: 'Enregistrement...',
      });
      this.loading.present();
      let operation = operationAvecDepense.operation;
      let depense = new Depense(this.constante.user.id,this.event.id);
      depense.idOperation=operation.id;
      depense.montant=-operation.montant;
      depense.commentaire=operation.description;
      depense.date=operation.date;
      this.restangular.one("depense").post("save",depense).subscribe(resp => {
        // Ajout à la liste
        this.loading.dismissAll();
        console.log("dépense sauvée");
        depense.id=resp.id;
        let montant =  depense.montant/this.participants.length;
        for(let participant of this.participants)
          if(participant.user.id!=depense.idPayeur)
            participant.doit+=montant;
          else {
            participant.aPaye += depense.montant;
            participant.doit -= depense.montant - montant;
          }
        this.event.montantTotal+=depense.montant;
      }, errorResponse => {
        console.log("Error with status code", errorResponse.status);


      });
    });
    modal.present();
  };
  ajouteDepense() {
    this.nav.push(CreationMouvementPage,{theEvent:this.event,theParticipants:this.participants});
  };

  sms(participant) {
    console.log("SMS!");
    let options = {
      replaceLineBreaks: false,
      android : {
        intent: 'INTENT'
      }
    }
    this.smsProvider.send("0682667921",'Ca roule?',options).then(rep=>{

    },err=> {

    })
  };
  interaction(participant) {
    console.log("interaction!");
  };
  phone(participant) {
    console.log("SMS!");
    let options = {
      replaceLineBreaks: false,
      android : {
        intent: ''
      }
    }
    this.smsProvider.send("0682667921",'Ca roulegggg?',options).then(rep=>{

    },err=> {

    })
  };

  showDepense() {
    this.nav.push(ListeDepense,{theEvent:this.event, theParticipants:this.participants});
  }
}
