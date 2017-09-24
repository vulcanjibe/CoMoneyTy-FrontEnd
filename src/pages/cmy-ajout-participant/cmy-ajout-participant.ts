import { Component } from '@angular/core';
import { NavController, LoadingController,NavParams } from 'ionic-angular';

import 'rxjs/Rx';

import {Event, Constante, User, LienEventUser, UserAvecDepense} from '../cmy-model/cmy.model';

import {Restangular} from 'ngx-restangular';
@Component({
  selector: 'ajout-participant-page',
  templateUrl: 'cmy-ajout-participant.html',
  providers:[Restangular]
})


export class AjoutParticipantPage {
  relations: Array<ParticipantPresent>;
  loading: any;
  event: Event;
  participantsEvent: Array<UserAvecDepense>;
  constructor(public nav: NavController,public constante:Constante,
    public loadingCtrl: LoadingController,private restangular: Restangular,public params: NavParams) {
    this.loading = this.loadingCtrl.create();
    this.event = params.get("theEvent");
    this.participantsEvent = params.get("participantsEvent");
  }

  ionViewDidLoad() {
    this.loading.present();
    // récupération de toutes les relations
    this.restangular.all('user/relations').getList().subscribe(relations => {
      this.relations = new Array();
      for(let relation of relations) {
        // Est-ce qu'il est déjà ajouté
        let trouve:boolean=false;
        for(let userAvecDepense of this.participantsEvent) {
            if(userAvecDepense.user.id==relation.id)
              trouve=true;
        }
        let relationPresent = new ParticipantPresent(relation,trouve);
        this.relations.push(relationPresent);
      }
      this.loading.dismiss();
    },errorResponse => {
      console.log("Error with status code", errorResponse.status);
    });

  }
  close() {
    for(let participantPresent of this.relations) {
      // Est-ce qu'il était là avant?
      let present = false;
      for(let userAvecDepense of this.participantsEvent) {
        if(userAvecDepense.user.id==participantPresent.user.id) {
          present = true;
          break;
        }
      }

      if(participantPresent.present &&!present){
        // Il est présnet mais n'était pas là avant
        let lien = new LienEventUser(participantPresent.user.id,this.event.id);
        this.restangular.one("lienEventUser").post("save",lien).subscribe(resp => {
          console.log("Ajout du participant : "+participantPresent.user.prenom);

          this.participantsEvent.push(new UserAvecDepense(participantPresent.user));
        }, errorResponse => {
          console.log("Error with status code", errorResponse.status);
        });
      } else if(!participantPresent.present &&present){
        // Il a été enlevé
        let lien = new LienEventUser(participantPresent.user.id,this.event.id);
        this.restangular.one("event").post("supprimeUser",lien).subscribe(resp => {
          console.log("Ajout du participant : "+participantPresent.user.prenom);
          let idx = 0;
          for(let particp of this.participantsEvent) {
            if(particp.user.id==participantPresent.user.id) {
              break;
            }
            idx++;
          }
          this.participantsEvent.splice(idx,1);
        }, errorResponse => {
          console.log("Error with status code", errorResponse.status);
        });

      }
    }
    this.nav.pop();
  }

  toogle(relation:ParticipantPresent)
  {
    relation.present=!relation.present;
  }
}
class ParticipantPresent {
  participant: User;
  present: boolean;
  constructor(public user: User,public pres:boolean) {
    this.participant=user;
    this.present = pres;
  }
}
