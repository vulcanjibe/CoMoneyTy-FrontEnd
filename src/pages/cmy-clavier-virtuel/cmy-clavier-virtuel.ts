import {Component} from '@angular/core';
import {NavController, LoadingController, AlertController} from 'ionic-angular';
import 'rxjs/Rx';
import {  Constante} from '../cmy-model/cmy.model';

import {Restangular} from 'ngx-restangular';

import {Home} from "../cmy-home/cmy-home";
import {WalkthroughPage} from "../walkthrough/walkthrough";

import CryptoJS from 'crypto-js';
@Component({
  selector: 'clavier-virtuel',
  templateUrl: 'cmy-clavier-virtuel.html',
  providers:[Restangular]
})
export class ClavierVirtuel {
  codeSaisie:string;
  codeSaisieEtoile:string;
  codeReel:string;
  nbEssai:number;
  private CryptoJS: any;
  constructor(public nav: NavController,public constante:Constante,
    public loadingCtrl: LoadingController,public alertCtrl: AlertController,private restangular: Restangular,private alertController:AlertController) {

  };


  ionViewDidLoad() {
    this.codeReel = localStorage.getItem("codecourt");
    this.codeSaisie="";
    this.codeSaisieEtoile="";
    this.nbEssai=3;
  };
  connexionClassique() {
    this.nav.setRoot(WalkthroughPage);
  };
  saisie(nombre:number) {
    this.codeSaisie = this.codeSaisie + nombre;
    this.codeSaisieEtoile+="*";
    if (this.codeSaisie.length == 4) {
      let user = JSON.parse(localStorage.getItem('user'));
      let codesaisieCrypte = CryptoJS.PBKDF2(this.codeSaisie, "AlwaysTheSameSalt", { keySize: 512/32, iterations: 5 }).toString();

      // Contrôle du code
      if (codesaisieCrypte == this.codeReel) {
        let user = JSON.parse(localStorage.getItem("user"));
        this.restangular.one("user").post("loginCourt", user).subscribe(resp => {
          localStorage.setItem('id_token', resp.id);
          localStorage.setItem('user', JSON.stringify(resp.user));
         // let hash = CryptoJS.SHA256("ddd").toString(CryptoJS.enc.Hex);;
          if(resp.user.codecourt!=null && resp.user.codecourt.length>0) {
            let derivedKey = CryptoJS.PBKDF2(resp.user.codecourt, "AlwaysTheSameSalt", {
              keySize: 512 / 32,
              iterations: 5
            }).toString();
            //     let derivedKey = bcryptjs.hashSync(resp.user.codecourt, resp.user.id);
            localStorage.setItem("codecourt", derivedKey);
          }
          this.constante.login(resp.user);
          this.nav.setRoot(Home);
        }, errorResponse => {
          this.traiteErreur();
          this.constante.traiteErreur(errorResponse,this);
        });
      } else {
        this.constante.presentToast("Le code saisi est incorrect!!!");
        this.traiteErreur();
      }
    }
  };

  traiteErreur()
  {
    this.codeSaisieEtoile="";
    this.codeSaisie="";
    this.nbEssai--;
    if(this.nbEssai==1) {
      this.constante.presentToast("Attention plus que un essai!!!");
    };
    if(this.nbEssai<=0) {
      this.constante.presentToast("Code verouillé!!");
      localStorage.removeItem("codecourt");
      this.nav.setRoot(WalkthroughPage);
    };

  }
}
