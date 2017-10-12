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
  eventsComplet: Array<Event>;
  loading: any;
  depenseTotale: number;
  constructor(public nav: NavController,public constante:Constante,
    public loadingCtrl: LoadingController,private restangular: Restangular) {
    this.loading = this.loadingCtrl.create();
    this.constante.eventChange.subscribe(event => {
      console.log("TouchEvent!");

      this.calculResume();
    });
  }
  calculResume() {
    this.depenseTotale = 0;
    if(this.eventsComplet==null)
      return;
    for(let event of this.eventsComplet)
    {
      this.depenseTotale+=event.montantDepense;
    }
  }
  ionViewDidLoad() {
    this.loading.present();

    console.log(this.constante.BASE_URL_REST);
    // This will query /accounts and return a observable.
    this.restangular.all('user/'+this.constante.user.id+'/events').getList().subscribe(events => {
      this.events = events;
      this.eventsComplet = events;
      this.calculResume();
      this.loading.dismiss();
    },errorResponse => {
      this.constante.traiteErreur(errorResponse,this);
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

  filtreEvent(ev) {
    console.log('Filtre');
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.events = this.eventsComplet.filter((item) => {
        return (JSON.stringify(item).toLocaleLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    } else {
      this.events = this.eventsComplet;
    }
  }

}
