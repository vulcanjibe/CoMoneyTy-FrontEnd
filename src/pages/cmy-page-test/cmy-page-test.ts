import { Component } from '@angular/core';

import 'rxjs/Rx';

import {Camera, CameraOptions} from '@ionic-native/camera';

import {Restangular} from 'ngx-restangular';
import {LoadingController, ToastController} from "ionic-angular";
import {Constante} from "../cmy-model/cmy.model";

@Component({
  selector: 'cmy-page-test',
  templateUrl: 'cmy-page-test.html',
  providers:[Restangular]
})
export class PageTest {
  loading: any;
  constructor(public constante:Constante, public loadingCtrl: LoadingController,private restangular:Restangular,private toastCtrl:ToastController) {
    this.loading = this.loadingCtrl.create();
  }
  resetData() {
    this.loading.present();
    this.restangular.one("utilitaire/initialisation").get().toPromise().then(rep=>{
      this.loading.dismissAll();
      let toast = this.toastCtrl.create({
        message: "Données réinitialisées!",
        duration: 3000,
        position: 'top'
      });
      toast.present();
      return;
    },error=>{
      this.constante.traiteErreur(error,this);
    })
  }
}
