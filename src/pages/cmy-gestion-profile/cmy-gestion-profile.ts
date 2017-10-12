import { Component } from '@angular/core';
import { NavController, ModalController, LoadingController } from 'ionic-angular';
import {FormGroup, FormControl, Validators} from '@angular/forms';


import { WalkthroughPage } from '../walkthrough/walkthrough';

import 'rxjs/Rx';
import {User} from "../cmy-model/cmy.model";
import { Constante } from '../cmy-model/cmy.model';
import {Restangular} from 'ngx-restangular';
import {createElementCssSelector} from "@angular/compiler";

@Component({
  selector: 'gestion-profile',
  templateUrl: 'cmy-gestion-profile.html',
  providers:[Restangular]
})
export class GestionProfile {
  settingsForm: FormGroup;
  // make WalkthroughPage the root (or first) page
  rootPage: any = WalkthroughPage;
  loading: any;
  user: User;

  constructor(
    public nav: NavController,
    public modal: ModalController,
    public loadingCtrl: LoadingController,public constante:Constante,private restangular: Restangular
  ) {
    this.loading = this.loadingCtrl.create();
    this.user = this.constante.user;
    this.settingsForm = new FormGroup({
      nom: new FormControl(this.user.nom+" "+this.user.prenom, Validators.required),
      password: new FormControl(this.user.password, Validators.required),
      email: new FormControl(this.user.email, Validators.required),
      phone: new FormControl(this.user.phone, Validators.required),
      iban: new FormControl(this.user.iban, Validators.required),
      currency: new FormControl("euro"),
      notifications: new FormControl(true)
    });
  }

  ionViewDidLoad() {


  }

  logout() {
    // navigate to the new page if it is not the current page
    this.constante.user=new User();
    this.nav.setRoot(this.rootPage);
  }

  save() {
    this.loading.present();
    let user = this.restangular.copy(this.user);
    user.route = "user";
    let str = this.settingsForm.get("nom").value;
    if(str.indexOf(" ")>0) {
      user.nom = str.split(" ")[0];
      user.prenom = str.split(" ")[1];
    } else {
      user.nom = str;
      user.prenom="";
    }
    user.password=this.settingsForm.get("password").value;
    user.email=this.settingsForm.get("email").value;
    user.phone=this.settingsForm.get("phone").value;
    user.iban=this.settingsForm.get("iban").value;

    user.save().toPromise().then(resp => {
      this.constante.user=resp;
      this.loading.dismissAll();
    },err=> {
      this.constante.traiteErreur(err,this);
    });
  }

}
