import { Component } from '@angular/core';
import {LoadingController, NavController, ToastController} from 'ionic-angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import {Restangular} from 'ngx-restangular';
import  {ListeEvent} from "../cmy-liste-event/cmy-liste-event";
import {SMS} from "@ionic-native/sms";
import {Constante} from "../cmy-model/cmy.model";
import {LoginPage} from "../login/login";

@Component({
  selector: 'forgot-password-page',
  templateUrl: 'forgot-password.html'
})
export class ForgotPasswordPage {
  forgot_password: FormGroup;
  main_page: { component: any };
  loading: any;
  constructor(public nav: NavController,private restangular: Restangular ,public loadingCtrl: LoadingController, private toastCtrl: ToastController,public constante:Constante,private smsProvider:SMS) {
    this.main_page = { component: LoginPage };

    this.forgot_password = new FormGroup({
      email: new FormControl('', Validators.compose([Validators.required,Validators.minLength(5),Validators.pattern("[a-z0-9.-_]+@[a-z.]+")])),
      phone: new FormControl('', Validators.compose([Validators.required,Validators.minLength(10),Validators.pattern("^(?:(?:\\+|00)33|0)\\s*[1-9](?:[\\s.-]*\\d{2}){4}$")]))
    });
  };

  recoverPassword(){
    let phone:string = this.forgot_password.get('phone').value;
    let email:string = this.forgot_password.get('email').value;

    // Vérification email et téléphone
    this.loading = this.loadingCtrl.create();
    this.loading.present();
    this.restangular.one("utilitaire").post("controleRecoverPassword",email+"<-->"+phone).toPromise().then(rep=>{
      this.loading.dismissAll();
      let message = "Votre mot de passe CoMoneyTy est : "+rep.password;
      this.smsProvider.send( phone, message, options).then(rep => {
        let toast = this.toastCtrl.create({
          message: "Votre password a été envoyé par SMS!",
          duration: 3000,
          position: 'top'
        });
        toast.present();
      },error=>{
        this.constante.traiteErreur(error,this);
      });

      return;
    },error=>{
      this.constante.traiteErreur(error,this);
    })

    let options = {
      replaceLineBreaks: false,
      android: {
        intent: ''
      }
    }

    this.nav.setRoot(this.main_page.component);
  };

  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  };

}
