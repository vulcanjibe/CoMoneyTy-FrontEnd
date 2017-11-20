import {Component, ElementRef, ViewChild} from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';

import 'rxjs/Rx';

import {Event,  Constante} from '../cmy-model/cmy.model';
import {DetailEventPage} from '../cmy-detail-event/cmy-detail-event';
import {CreationEventPage} from '../cmy-creation-event/cmy-creation-event';
import {Restangular} from 'ngx-restangular';
import {MenuCircular,SousMenu} from "../../components/menu-circular/menu-circular";
@Component({
  selector: 'liste-event',
  templateUrl: 'cmy-liste-event.html',
  providers:[Restangular]
})
export class ListeEvent {
  events: Array<Event>;
  eventsComplet: Array<Event>;
  loading: any;
  depenseTotale: number;
  @ViewChild('menu') menu:MenuCircular;
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
    let sousmenus:Array<SousMenu> = new Array();
    sousmenus.push(new SousMenu("Fermer",this.close,"home"));
    sousmenus.push(new SousMenu("Annuler",this.trash,"trash"));
    sousmenus.push(new SousMenu("Cloturer",this.copy,"copy"));
    this.menu.config(sousmenus);
  }
  createNewEvent() {
    console.log("Creation Event!");
    this.nav.push(CreationEventPage,{listeEvent:this.events});
  }
  trash(eventSelectionne: Event,parent: ListeEvent) {
    console.log("annulation de "+eventSelectionne.id);
    let eventRest = parent.restangular.copy(eventSelectionne);
    eventRest.route = "event";
    eventRest.etat = "Annulé";
    parent.loading = parent.loadingCtrl.create();
    parent.loading.present();
    eventRest.save().toPromise().then(resp=> {
      parent.loading.dismissAll();
      eventSelectionne.etat="Annulé";
      parent.menu.close();
    }, errorResponse => {
      parent.constante.traiteErreur(errorResponse,this);
    });
  };
  close(eventSelectionne: Event,parent: ListeEvent) {
    console.log("annulation de "+eventSelectionne.id);
    let eventRest = parent.restangular.copy(eventSelectionne);
    eventRest.route = "event";
    eventRest.etat = "Fermé";
    eventRest.save().toPromise().then()
    parent.loading = parent.loadingCtrl.create();
    parent.loading.present();
    eventRest.save().toPromise().then(resp=> {
      parent.loading.dismissAll();
      eventSelectionne.etat="Fermé";
      parent.menu.close();
    }, errorResponse => {
      parent.constante.traiteErreur(errorResponse,this);
    });
  };

  showMenu(event:Event) {
    this.menu.show(this,event,event.urlPhoto);
    this.menu.toggle();
  }

  copy(event:Event) {
    console.log("Copy de EVENT : "+event.libelle);
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
