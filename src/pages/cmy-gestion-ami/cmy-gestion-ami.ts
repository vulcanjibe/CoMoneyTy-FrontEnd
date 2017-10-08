import { Component } from '@angular/core';
import { NavController, LoadingController,NavParams } from 'ionic-angular';
import 'rxjs/Rx';

import { Constante,  Invitation} from '../cmy-model/cmy.model';

import {Restangular} from 'ngx-restangular';
import {InvitationAmi} from "../cmy-invitation-ami/cmy-invitation-ami";
@Component({
  selector: 'gestion-ami',
  templateUrl: 'cmy-gestion-ami.html',
  providers:[Restangular]
})


export class GestionAmi {
  invitations: Array<Invitation>;
  loading: any;
  constructor(public nav: NavController,public constante:Constante,
    public loadingCtrl: LoadingController,private restangular: Restangular,public params: NavParams) {
    this.loading = this.loadingCtrl.create();
  }

  ionViewDidLoad() {
    this.loading.present();
    // récupération de toutes les relations
    this.restangular.all('user/'+this.constante.user.id+'/invitations').getList().subscribe(invits => {
      this.invitations=invits;
      this.loading.dismiss();
    },errorResponse => {
      console.log("Error with status code", errorResponse.status);
    });

  }


  ajouteInvitation() {
    this.nav.push(InvitationAmi,{'theInvitations':this.invitations});
  }
}
