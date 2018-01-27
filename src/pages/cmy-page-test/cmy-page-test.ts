import {Component} from '@angular/core';


import {Restangular} from 'ngx-restangular';
import {Events, LoadingController, NavController, ToastController} from "ionic-angular";
import {Constante, User} from "../cmy-model/cmy.model";
import {ListeUser} from "./cmy-liste-user";
import {AppVersion} from "@ionic-native/app-version";
import {FileTransfer} from '@ionic-native/file-transfer';
import {File} from '@ionic-native/file';
import {FileChooser} from '@ionic-native/file-chooser';
import {EventService} from "./event.service";
import {error} from "util";

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
  etatPerformance:String;
  colorPerformance:String;
  tpsReponseTraitement:number;
  version1:string;
  version2:string;
  user:User;
  etatIndex:string="";
  constructor(private eventService: EventService ,private fileChooser: FileChooser,private transfer: FileTransfer, private file: File,private angularEvents:Events,private appVersion: AppVersion,public nav: NavController,public constante:Constante, public loadingCtrl: LoadingController,private restangular:Restangular,private toastCtrl:ToastController) {
    this.user = this.constante.user;
  };

  ionViewDidLoad() {
    this.getVersion();
    this.restangular.one("utilitaire/rechercheIndexManquant").get().toPromise().then(rep => {
      let msg: string = "Recherche Index ";
      msg += rep.message;
      this.etatIndex=rep.message;
    }, error => {
      this.constante.traiteErreur(error, this);
    });
  };


  resetData() {
    this.loading = this.loadingCtrl.create();

    this.tpsReponseTraitement=0;
    this.tpsReponseCouchbase=0;
    this.tpsReponseServeur=0;
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
  };
  getVersion() {
    this.appVersion.getVersionCode().then(rep=> {
      this.version1=rep;
    },error => {
      this.version1="--";
      // console.log(error);
    });
    this.appVersion.getVersionNumber().then(rep=> {
      this.version2=rep;
    },error => {
      this.version2="--";
    });
  }
  checkInfra() {
    this.loading = this.loadingCtrl.create();
    this.loading.present();
    this.etatServeur="thumbs-down";
    this.etatDatabase="thumbs-down";
    this.colorServeur="danger";
    this.colorDatabase="danger";
    let dateAppel:Date = new Date();

    this.restangular.one("utilitaire/checkReseau").get().toPromise().then(rep=>{
      this.loading.dismissAll();
      this.etatServeur="thumbs-up";
      this.colorServeur="secondary";
      let timeFinServeur = rep.message.split(":")[1];
      this.tpsReponseServeur = new Date().getTime() - dateAppel.getTime();
      console.log("Appel : "+dateAppel.getTime());
    },error=>{
      this.etatServeur="thumbs-down";
      this.colorServeur="danger";
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
      this.colorDatabase="danger";
      this.constante.traiteErreur(error,this);
    });
    this.restangular.one("utilitaire/checkPerformance").get().toPromise().then(rep=>{
      this.loading.dismissAll();
      this.etatPerformance="thumbs-up";
      this.colorPerformance="secondary";
      let timeFin = rep.stop;
      let timeDebut = rep.start;
      this.tpsReponseTraitement = timeFin - timeDebut;
      if(this.tpsReponseTraitement>1000) {
        this.etatPerformance="thumbs-down";
        this.colorPerformance="danger";
      }
    },error=>{
      this.etatPerformance="thumbs-down";
      this.colorPerformance="danger";
      this.constante.traiteErreur(error,this);
    });

  };


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

  };

  alerteur() {
    this.constante.presentToast("Appui long pour déclencher!");
  };


  swapUser() {
    this.nav.push(ListeUser);
    this.angularEvents.subscribe("swapUser",resp=>{
      console.log("SWAP TO : "+resp);
      this.user = resp;
    });
  };

  toogleRecuperationIndex() {
    this.loading = this.loadingCtrl.create();
    this.loading.present();
    this.restangular.one("utilitaire/toggleRechercheIndexManquant").get().toPromise().then(rep => {
      this.loading.dismissAll();
      let msg: string = "Recherche Index ";
      msg += rep.message;
      this.etatIndex=rep.message;
      let toast = this.toastCtrl.create({
        message: msg,
        duration: 3000,
        position: 'top'
      });
      toast.present();
      return;
    }, error => {
      this.constante.traiteErreur(error, this);
    });
  };

    showRecuperationIndex() {
      this.loading = this.loadingCtrl.create();
      this.loading.present();
      this.restangular.one("utilitaire/indexManquant").get().toPromise().then(rep=>{
        this.loading.dismissAll();
        console.log(rep);
        return;
      },error=>{
        this.constante.traiteErreur(error,this);
      });
    };

  testService() {
    this.loading = this.loadingCtrl.create();
    this.loading.present();
    let user:User = this.constante.user;
    let _env = this;
    this.eventService.getEvents(user)
      .then(function(events) {
        _env.loading.dismissAll();
        console.log(events);
      }, function(error) {
        _env.loading.dismissAll();
        console.log(error);
      });
  };
}
