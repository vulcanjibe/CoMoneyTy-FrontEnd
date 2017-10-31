import { Component } from '@angular/core';
import {NavController, LoadingController, NavParams, ModalController, ToastController} from 'ionic-angular';
import 'rxjs/Rx';

import {Constante, Invitation, LienEventUser, User} from '../cmy-model/cmy.model';

import {Restangular} from 'ngx-restangular';
import {InvitationAmi} from "../cmy-invitation-ami/cmy-invitation-ami";
import {ModalChoixEvent} from "../cmy-modal/modal-choix-event";
@Component({
  selector: 'gestion-ami',
  templateUrl: 'cmy-gestion-ami.html',
  providers:[Restangular]
})


export class GestionAmi {
  invitations: Array<Invitation>;
  amis:Array<User>;
  amisInitial:Array<User>;
  loading: any;
  action:any;
  constructor(public nav: NavController,public constante:Constante,
    public loadingCtrl: LoadingController,private toastCtrl:ToastController,private modalController:ModalController,private restangular: Restangular,public params: NavParams) {
    this.loading = this.loadingCtrl.create();
    this.action={'encours':false};
  };

  ionViewDidLoad() {
    this.loading.present();
    // récupération de toutes les relations
    this.restangular.all('user/'+this.constante.user.id+'/invitations').getList().subscribe(invits => {
      this.invitations=invits;
      this.loading.dismiss();
    },errorResponse => {
      this.constante.traiteErreur(errorResponse,this);
    });
    this.restangular.all('user/'+this.constante.user.id+'/relations').getList().subscribe(amis => {
      this.amis=amis;
      this.amisInitial=amis;
      this.loading.dismiss();
    },errorResponse => {
      this.constante.traiteErreur(errorResponse,this);
    });
  };


  ajouteInvitation() {
    this.nav.push(InvitationAmi,{'theInvitations':this.invitations});
  };

  open(ami:User)
  {
    if(this.action.encours) {
      return;
    }
    this.action={'encours':true};
    //

    this.action.encours=false;
  };

  affecte(ami:User)
  {
    if(this.action.encours) {
      return;
    }
    this.action={'encours':true};
    let modal = this.modalController.create(ModalChoixEvent);
    modal.onDidDismiss(event => {
      if (event == null) {
        return;
      }
      this.loading = this.loadingCtrl.create({
        content: 'Enregistrement...',
      });
      this.loading.present();
      // Il est présnet mais n'était pas là avant
      let lien = this.restangular.copy(new LienEventUser(ami.id,event.id));
      lien.route='lienEventUser';
      lien.save().toPromise().then(rep=>{
        this.loading.dismiss();
        this.action.encours=false;
      },err=>{
        this.loading.dismiss();
        this.action.encours=false;
        let toast = this.toastCtrl.create({
          message: "Le user est déjà affecté à cet event!",
          duration: 3000,
          position: 'top'
        });
        toast.present();
      })

    });
    modal.present();
  };
  filtreAmi(ev) {
    console.log('Filtre');
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.amis = this.amisInitial.filter((item) => {
        return (JSON.stringify(item).toLocaleLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    } else {
      this.amis = this.amisInitial;
    }
  };
}
