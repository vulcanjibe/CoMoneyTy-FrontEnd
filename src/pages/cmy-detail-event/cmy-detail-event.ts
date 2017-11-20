import { Component } from '@angular/core';
import {
  NavController, LoadingController, NavParams, ModalController, AlertController,
  ToastController
} from 'ionic-angular';
import { SMS} from '@ionic-native/sms';

import 'rxjs/Rx';

import {Event, UserAvecDepense, Constante, Depense, Mouvement} from '../cmy-model/cmy.model';
import { AjoutParticipantPage } from '../cmy-ajout-participant/cmy-ajout-participant'
import {Restangular} from 'ngx-restangular';
import {CreationDepensePage} from "../cmy-creation-depense/cmy-creation-depense";
import {ModalChoixOperation} from "../cmy-modal/modal-choix-operation";
import {ListeDepense} from "../cmy-liste-depense/cmy-liste-depense";
import {BilanEvent} from "../cmy-bilan-event/cmy-bilan-event";
@Component({
  selector: 'detail-event-page',
  templateUrl: 'cmy-detail-event.html',
  providers:[Restangular]
})
export class DetailEventPage {
  event: Event;
  participants: Array<UserAvecDepense>;
  loading: any;

  constructor(private nav: NavController,
              private loadingCtrl: LoadingController,private toastCtrl:ToastController,private alertCtrl:AlertController,private constante:Constante,private restangular: Restangular,private navParams: NavParams,private modalController:ModalController,private smsProvider:SMS) {
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
      this.constante.traiteErreur(errorResponse,this);
    });

  }

  addNewParticipant() {

    if(this.event.etat!="Ouvert")
    {
      this.presentToast("L'event n'est plus ouvert... Impossible de modifier les participants!");
      return;
    };
    if(this.event.roles.indexOf("Createur")<0)
    {
      this.constante.presentToast("Seul le créateur peut modifier les participants!");
      return;
    };
   this.nav.push(AjoutParticipantPage,{theEvent:this.event,participantsEvent: this.participants}).then(end=>{

   });

  }
  rechercheOperation() {
    if(this.event.etat!="Ouvert")
    {
      this.presentToast("L'event n'est plus ouvert... Impossible d'ajouter des dépenses!");
      return;
    }

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
        this.event.montantDepense+=depense.montant;
        for(let participant of this.participants) {
          if (participant.user.id == this.constante.user.id)
            this.event.montantDu = participant.doit;
        }
        this.constante.touchEvent(this.event);
      }, errorResponse => {
        this.constante.traiteErreur(errorResponse,this);
      });
    });
    modal.present();
  };
  ajouteDepense() {
    if(this.event.etat!="Ouvert")
    {
      this.presentToast("L'event n'est plus ouvert... Impossible d'ajouter des dépenses!");
      return;
    }

    this.nav.push(CreationDepensePage,{theEvent:this.event,theParticipants:this.participants});
  };
  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  };

  donneArgent(participant:UserAvecDepense) {
    const alert = this.alertCtrl.create({
      title: 'Payer '+participant.user.prenom,
      message: 'Quel montant avez-vous donner à '+participant.user.prenom+'?',
      inputs: [
        {
          name: 'montant',
          placeholder: 'Montant en €'
        }],
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
            // On va créer un mouvement
            let mvt = new Mouvement(this.constante.user.id,this.event.id);
            mvt.commentaire="Argent donné";
            mvt.date=new Date();
            mvt.idDestinataire = participant.user.id;
            mvt.etat="Réalisé";
            mvt.montant=data.montant;
            let mvtRest = this.restangular.copy(mvt);
            mvtRest.route="mouvement";
            mvtRest.save().toPromise().then(rep => {
                this.loading.dismissAll();
                this.presentToast("Argent envoyé!");
                // Recalcul des montatns par particpant
              for(let participant of this.participants) {
                if (participant.user.id == rep.idDestinataire) {
                  participant.doit += rep.montant;
                  participant.aPaye -= rep.montant;
                }
                if (participant.user.id == rep.idEmetteur) {
                  participant.doit -= rep.montant;
                  participant.aPaye += rep.montant;
                }

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


  sms(participant) {
    console.log("SMS!");
    let options = {
      replaceLineBreaks: false,
      android : {
        intent: 'INTENT'
      }
    };
    this.smsProvider.send("0682667921",'Ca roule?',options).then(rep=>{

    },err=> {
      this.constante.traiteErreur(err,this);
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
    };
    this.smsProvider.send("0682667921",'Ca roulegggg?',options).then(rep=>{

    },err=> {
      this.constante.traiteErreur(err,this);
    })
  };

  showDepense() {
    this.nav.push(ListeDepense,{theEvent:this.event, theParticipants:this.participants});
  };

  bilan() {
    this.nav.push(BilanEvent,{theEvent:this.event, theParticipants:this.participants});
  };

  toggleRole(participant:UserAvecDepense) {
    if(this.event.roles.indexOf("Createur")<0)
    {
      this.constante.presentToast("Seul le créateur peut modifier les participants!");
      return;
    };
    // Bascule du role createur
    this.loading = this.loadingCtrl.create();
    this.loading.present();
    this.restangular.one("event/"+this.event.id+"/"+participant.user.id+"/toggleRole").get().subscribe( lien => {
     // console.log(lien);
      participant.roles=lien.roles;
      this.loading.dismissAll();
    },err=> {
      this.constante.traiteErreur(err,this);
    });
  };
}
