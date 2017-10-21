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
  encours:boolean = false;
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
    this.restangular.all('user/'+this.constante.user.id+'/relations').getList().subscribe(relations => {
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
      this.constante.traiteErreur(errorResponse,this);
    });

  }
  close() {
    this.loading = this.loadingCtrl.create();
    this.loading.present();
    this.encours=true;
    let tab:Array<any>=[];
    let commandes:Array<CommandeAddDelParticipant> = new Array();
    for(let participantPresent of this.relations) {
      // Est-ce qu'il était là avant?
      let present = false;
      for(let userAvecDepense of this.participantsEvent) {
        if(userAvecDepense.user.id==participantPresent.participant.id) {
          present = true;
          break;
        }
      }
      let commande:CommandeAddDelParticipant = new CommandeAddDelParticipant();
      commande.lienEventUser=new LienEventUser(participantPresent.participant.id,this.event.id);

      if(participantPresent.present &&!present){
        // Il est présnet mais n'était pas là avant
        //let lien = this.restangular.copy(new LienEventUser(participantPresent.participant.id,this.event.id));
        //lien.route='lienEventUser';
        //tab.push(lien.save().toPromise());
        commande.commande="ADD";
      } else if(!participantPresent.present &&present){
        // Il a été enlevé
        //let lien = new LienEventUser(participantPresent.participant.id,this.event.id);
        //tab.push(this.restangular.one("event").post("supprimeUser",lien).toPromise());
        commande.commande="DEL";
      }
      if(commande.commande!=null)
        commandes.push(commande);
    }
    if(commandes.length>0) {
      // dans les 2 cas, je refresh la liste pour ne pas refaire les répartitions en local
      this.restangular.one("event").post("ajoutSuppressionUser",commandes).subscribe(rep=>{
        //this.refresh();
        this.participantsEvent.splice(0,this.participantsEvent.length);
        for(let part of rep)
          this.participantsEvent.push(part);
        this.loading.dismiss();
        this.encours=false;
        this.nav.pop();
      },err=>{
        this.encours=false;
        this.constante.traiteErreur(err,this);
      });
    } else {
      this.encours=false;
      this.nav.pop();
    }

  }

  toogle(relation:ParticipantPresent)
  {
    relation.present=!relation.present;
  }


}
class ParticipantPresent {
  participant: User;
  present: boolean;
  constructor(private user: User,private pres:boolean) {
    this.participant=user;
    this.present = pres;
  }
}

class CommandeAddDelParticipant {
  commande:string;
  lienEventUser:LienEventUser;
}
