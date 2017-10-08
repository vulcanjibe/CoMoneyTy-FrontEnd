import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';

import 'rxjs/Rx';

import {Event,  Constante} from '../cmy-model/cmy.model';
import {DetailEventPage} from '../cmy-detail-event/cmy-detail-event';
import {CreationEventPage} from '../cmy-creation-event/cmy-creation-event';
import {Restangular} from 'ngx-restangular';
@Component({
  selector: 'list-2-event-page',
  templateUrl: 'cmy-liste-event.html',
  providers:[Restangular]
})
export class List2EventPage {
  events: Array<Event>;
  loading: any;

  constructor(public nav: NavController,public constante:Constante,
    public loadingCtrl: LoadingController,private restangular: Restangular) {
    this.loading = this.loadingCtrl.create();
    this.constante.eventChange.subscribe(event => {
      console.log("Event modifié!!!");
      if(this.events==null)
        return;
      for(let ev of this.events)
      {
        if(ev.id==event.id)
        {
          ev.montantTotal=event.montantTotal;
          break;
        }
      }
    });
  }

  ionViewDidLoad() {
    this.loading.present();

    console.log(this.constante.BASE_URL_REST);
    // This will query /accounts and return a observable.
    this.restangular.all('user/'+this.constante.user.id+'/events').getList().subscribe(events => {
      this.events = events;
      this.loading.dismiss();
    },errorResponse => {
      console.log("Error with status code", errorResponse.status);
    });

  }
  createNewEvent() {
    console.log("Creation Event!");
    this.nav.push(CreationEventPage,{listeEvent:this.events});
  }
  open(eventSelectionne: Event) {
    console.log("Ouverture de "+eventSelectionne.id);
    this.nav.push(DetailEventPage,{theEvent:eventSelectionne});
  };
}
