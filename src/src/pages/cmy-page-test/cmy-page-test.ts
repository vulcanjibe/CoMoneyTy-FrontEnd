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
  etatServeur:String;
  colorServeur:String;
  colorDatabase:String;
  tpsReponseServeur:number;
  etatDatabase:String;
  tpsReponseCouchbase:number;

  constructor(public constante:Constante, public loadingCtrl: LoadingController,private restangular:Restangular,private toastCtrl:ToastController) {

  }
  resetData() {
    this.loading = this.loadingCtrl.create();
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
  alerting() {
    let toast = this.toastCtrl.create({
      message: "Appui long pour déclencher la commande",
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }
  checkInfra() {
    this.loading = this.loadingCtrl.create();
    this.loading.present();
    this.etatServeur="thumbs-down";
    this.etatDatabase="thumbs-down";
    this.colorServeur="danger";
    this.colorDatabase="danger";
    let dateAppel:Date = new Date();

    this.restangular.one("utilitaire/checkServeur").get().toPromise().then(rep=>{
      this.loading.dismissAll();
      this.etatServeur="thumbs-up";
      this.colorServeur="secondary";
      let timeFin = rep.message.split(":")[1];
      this.tpsReponseServeur = timeFin - dateAppel.getTime();
      console.log("Appel : "+dateAppel.getTime());
    },error=>{
      this.etatServeur="thumbs-down";
      this.constante.traiteErreur(error,this);
    });
    this.restangular.one("utilitaire/checkDatabase").get().toPromise().then(rep=>{
      this.loading.dismissAll();
      this.etatDatabase="thumbs-up";
      this.colorDatabase="secondary";
      let timeServeur = rep.message.split(":")[1];
      let timeFin = rep.message.split(":")[2];
      this.tpsReponseCouchbase = timeFin - timeServeur;
      console.log("Appel : "+dateAppel.getTime());
    },error=>{
      this.etatDatabase="thumbs-down";
      this.constante.traiteErreur(error,this);
    });

  }

  purgeServeur() {
    this.loading = this.loadingCtrl.create();
    this.loading.present();
    this.restangular.one("utilitaire/purgeServeur").get().toPromise().then(rep=>{
      this.loading.dismissAll();
      let toast = this.toastCtrl.create({
        message: "Données réinitialisées : "+rep.message+"!",
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
