import { Component } from '@angular/core';

import 'rxjs/Rx';

import {Camera, CameraOptions} from '@ionic-native/camera';

import {Restangular} from 'ngx-restangular';
import {Events, LoadingController, NavController, ToastController} from "ionic-angular";
import {Constante, User} from "../cmy-model/cmy.model";
import {eraseStyles} from "@angular/animations/browser/src/util";

@Component({
  selector: 'cmy-liste-user',
  templateUrl: 'cmy-liste-user.html',
  providers:[Restangular]
})
export class ListeUser {
  loading: any;
  users:Array<User>;
  constructor(private angularEvents:Events,public nav: NavController,public constante:Constante, public loadingCtrl: LoadingController,private restangular:Restangular,private toastCtrl:ToastController) {

  }
  ionViewDidLoad() {
    this.restangular.all('user').getList().subscribe(users => {
      this.users=users;
    },error=>{
      this.constante.traiteErreur(error,this);
    })
  }

  swapUser(user:User) {
    localStorage.removeItem('id_token');
    localStorage.removeItem('user');
    user.password="BRUTEFORCE!!!";
    this.restangular.one("user").post("login",user).subscribe(resp => {
      localStorage.setItem('id_token', resp.id);
      localStorage.setItem('user', JSON.stringify(resp.user));
      this.constante.user=resp.user;
      this.constante.presentToastAvecPosition("Nouvel utilisateur : "+user.prenom,"bottom");
      this.angularEvents.publish("swapUser",resp.user);
      this.nav.pop();
    }, errorResponse => {
      console.log("Error with status code", errorResponse.status);
    });
  }
}
