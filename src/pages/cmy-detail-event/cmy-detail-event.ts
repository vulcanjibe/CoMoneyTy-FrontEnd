import { Component } from '@angular/core';
import { NavController, LoadingController,NavParams } from 'ionic-angular';

import 'rxjs/Rx';

import { Event,UserAvecDepense,Constante } from '../cmy-model/cmy.model';
import { AjoutParticipantPage } from '../cmy-ajout-participant/cmy-ajout-participant'
import {Restangular} from 'ngx-restangular';
import {CreationMouvementPage} from "../cmy-creation-mouvement/cmy-creation-mouvement";
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
    public loadingCtrl: LoadingController,public constante:Constante,private restangular: Restangular,public navParams: NavParams) {
    this.loading = this.loadingCtrl.create();
    this.event = navParams.get("theEvent");
  }

  ionViewDidLoad() {
    this.loading.present();

    // Lecture des participants de cet event
    this.restangular.all('event/'+this.event.id+'/users').getList().subscribe(particpants => {
      this.participants = particpants;
      for(let participant of this.participants)
      {
        if(!participant.user.urlAvatar.startsWith("http"))
          participant.user.urlAvatar=this.constante.REP_IMAGE+"user/"+participant.user.urlAvatar;
      }
      this.loading.dismiss();
    }, errorResponse => {
      console.log("Error with status code", errorResponse.status);
    });

  }

  addNewParticipant() {
    console.log("Creation Event!");
   this.nav.push(AjoutParticipantPage,{theEvent:this.event,participantsEvent: this.participants});
  }

  ajouteDepense() {
    this.nav.push(CreationMouvementPage,{theEvent:this.event,theParticipants:this.participants});
  };

}
