import {Component, ViewChild} from '@angular/core';
import {AlertController, LoadingController, NavController} from 'ionic-angular';
import {Constante, Event} from '../cmy-model/cmy.model';
import {DetailEventPage} from '../cmy-detail-event/cmy-detail-event';
import {CreationEventPage} from '../cmy-creation-event/cmy-creation-event';
import {Restangular} from 'ngx-restangular';
import {MenuCircular, SousMenu} from "../../components/menu-circular/menu-circular";
import {ListeHistorique} from "../cmy-liste-historique/cmy-liste-historique";
import {GestionProfile} from "../cmy-gestion-profile/cmy-gestion-profile";

//import 'rxjs/Rx';
@Component({
  selector: 'liste-event',
  templateUrl: 'cmy-liste-event.html',
  providers:[Restangular]
})
export class ListeEvent {
  events: Array<Event>;
  eventsComplet: Array<Event>;
  loading: any;
  filtreEtat: Array<string>;
  valeurFiltre: string;
  depenseTotale: number;
  visible:boolean = false;
  @ViewChild('menu') menu:MenuCircular;
  constructor(public nav: NavController,public constante:Constante,
    public loadingCtrl: LoadingController,public alertCtrl: AlertController,private restangular: Restangular,private alertController:AlertController) {
    this.loading = this.loadingCtrl.create();
    this.visible=false;
    this.filtreEtat = new Array();
    this.filtreEtat.push("Ouvert");
    this.filtreEtat.push("En cours de solde");
    this.constante.eventChange.subscribe(newEvent => {
      console.log("TouchEvent!");
      this.calculResume(newEvent);
    });
  };

  filtreType() {
    let alert = this.alertCtrl.create({
      cssClass: 'category-prompt'
    });
    alert.setTitle('Filtre par type');
    alert.addInput({
      type: 'checkbox',
      label: 'En cours',
      value: 'Ouvert',
      checked: this.filtreEtat.indexOf('Ouvert')>-1
    });

    alert.addInput({
      type: 'checkbox',
      label: 'En cours de solde',
      value: 'En cours de solde',
      checked: this.filtreEtat.indexOf('En cours de solde')>-1
    });

    alert.addInput({
      type: 'checkbox',
      label: 'Clos',
      value: 'Clos',
      checked: this.filtreEtat.indexOf('Clos')>-1
    });
    alert.addInput({
      type: 'checkbox',
      label: 'Annulé',
      value: 'Annulé',
      checked: this.filtreEtat.indexOf('Annulé')>-1
    });
    alert.addButton('Annule');
    alert.addButton({
      text: 'OK',
      handler: data => {
        console.log('Checkbox data:', data);
        this.filtreEtat=data;
        this.filtreEvent(this.valeurFiltre);
      }
    });
    alert.present().then(res => {
      console.log(res);
    });
  };

  calculResume(newEvent:Event) {
    this.depenseTotale = 0;
    if(this.events==null)
      return;
    for(let event of this.events)
    {
      if(newEvent!=null && newEvent.id==event.id) {
        event.montantDu = newEvent.montantDu;
        event.montantDepense = newEvent.montantDepense;
        event.montantTotal = newEvent.montantTotal;
      }
      if(event.montantDu>0)
        this.depenseTotale+=event.montantDu;
    }
  }
  ionViewDidLoad() {
    this.loading.present();

    console.log(this.constante.BASE_URL_REST);
    // This will query /accounts and return a observable.
    this.restangular.all('user/'+this.constante.user.id+'/events').getList().subscribe(events => {
      this.events = events;
      this.eventsComplet = events;
      this.calculResume(null);
      this.filtreEvent("");
      this.loading.dismiss();

      if(this.constante.user.phone==null || this.constante.user.phone.length<5) {
        if (events.log() == 0) {
          const alert = this.alertController.create({
            title: 'Votre profil est incomplet (Téléphone!)',
            message: "Voulez-vous accéder directement à votre profil pour le compléter?",
            buttons: [
              {
                text: 'Oui',
                role: 'cancel',
                handler: () => {
                  this.nav.push(GestionProfile);
                }
              },
              {
                text: 'Non',
                handler: () => {

                }
              }

            ]
          });
          alert.present();
        }
      };
    },errorResponse => {
      this.constante.traiteErreur(errorResponse,this);
    });
    let sousmenus:Array<SousMenu> = new Array();
    sousmenus.push(new SousMenu("Fermer",this.close,"home"));
    sousmenus.push(new SousMenu("Annuler",this.trash,"trash"));
    sousmenus.push(new SousMenu("Copier",this.copy,"copy"));
    sousmenus.push(new SousMenu("Log",this.log,"list"));
    sousmenus.push(new SousMenu("Quitter",this.closeMenu,"close"));
    this.menu.config(sousmenus);
  }
  createNewEvent() {
    console.log("Creation Event!");
    this.nav.push(CreationEventPage,{listeEvent:this.events});
  }
  public trash(eventSelectionne: Event) {
    if(eventSelectionne.roles.indexOf("Createur")<0)
    {
      this.constante.presentToast("Seul le créateur peut annuler un event!");
      return;
    };
    const alert = this.alertController.create({
      title: "Supprimer l'event?",
      message: "Confirmez-vous que vous voulez supprimer cet event?",
      buttons: [
        {
          text: 'Oui',
          role: 'cancel',
          handler: () => {
            // On bascule juste le mouvement en "effectué"
            console.log("annulation de "+eventSelectionne.id);
            let eventRest = this.restangular.copy(eventSelectionne);
            eventRest.route = "event";
            eventRest.etat = "Annulé";
            this.loading = this.loadingCtrl.create();
            this.loading.present();
            eventRest.save().toPromise().then(resp=> {
              this.loading.dismissAll();
              eventSelectionne.etat="Annulé";
              this.menu.close();
            }, errorResponse => {
              this.constante.traiteErreur(errorResponse,this);
            });
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

  };
  log(eventSelectionne: Event) {
    this.menu.close();
    this.nav.push(ListeHistorique, {theEvent: eventSelectionne});
  };
  close(eventSelectionne: Event) {
    if(eventSelectionne.roles.indexOf("Createur")<0)
    {
      this.constante.presentToast("Seul le créateur peut annuler un event!");
      return;
    };
    const alert = this.alertController.create({
      title: "Fermer l'event?",
      message: "Confirmez-vous que vous voulez fermer cet event?",
      buttons: [
        {
          text: 'Oui',
          role: 'cancel',
          handler: () => {
            console.log("Fermeture de " + eventSelectionne.id);
            let eventRest = this.restangular.copy(eventSelectionne);
            eventRest.route = "event";
            eventRest.etat = "Clos";
            eventRest.save().toPromise().then()
            this.loading = this.loadingCtrl.create();
            this.loading.present();
            eventRest.save().toPromise().then(resp => {
              this.loading.dismissAll();
              eventSelectionne.etat = "Clos";
              this.menu.close();
            }, errorResponse => {
              this.constante.traiteErreur(errorResponse, this);
            });
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
  };

  showMenu(event:Event) {
    this.visible = true;
    this.menu.show(this,event,event.urlPhoto);
    this.menu.toggle();
  };
  closeMenu() {
    this.visible = false;
    this.menu.toggle();
    this.menu.close();
  };

  copy(event:Event) {
    console.log("Copy de EVENT : "+event.libelle);
  };

  open(eventSelectionne: Event) {
    console.log("Ouverture de "+eventSelectionne.id);
    this.nav.push(DetailEventPage,{theEvent:eventSelectionne});
  };

  filtreEvent(val) {
    console.log('Filtre');
    this.valeurFiltre = val;

    // if the value is an empty string don't filter the items

    this.events = this.eventsComplet.filter((item) => {
      let bool1 = true;
      let bool2 = true;
      if(val && val.trim() != '') {
        bool1 =  JSON.stringify(item).toLocaleLowerCase().indexOf(val.toLowerCase()) > -1;
      }
      if(this.filtreEtat!=null && this.filtreEtat.length>0)
        bool2 = this.filtreEtat.indexOf(item.etat) > -1;
      return bool1 && bool2;
    });
    this.calculResume(null);
  };

  blockEvent() {
    console.log("Il faut bloquer!!!");
//    this.parent.cover.nativeElement.style.display="none";
    this.visible=false;
  };

}
