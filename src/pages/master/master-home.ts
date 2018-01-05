import {Component} from '@angular/core';


import {Restangular} from 'ngx-restangular';
import {AlertController, LoadingController, NavController, ToastController} from "ionic-angular";
import {Constante} from "../cmy-model/cmy.model";
import {Home} from "../cmy-home/cmy-home";


@Component({
  selector: 'master-home',
  templateUrl: 'master-home.html',
  providers:[Restangular]
})
export class MasterHome {
  loading: any;
  constructor(public nav: NavController,public constante:Constante, public loadingCtrl: LoadingController,private restangular:Restangular,private alertController:AlertController,private toastCtrl:ToastController) {

  };

  ionViewDidLoad() {

  };

  goToPartage() {
    this.nav.setRoot(Home);
  };
  goToCommunaute() {
    this.constante.presentToast("Bientôt disponible!");
  };
  goToDemo() {
    this.constante.presentToast("Bientôt disponible!");
  };
  goToCagnotte() {
    this.constante.presentToast("Bientôt disponible!");
  };

}
