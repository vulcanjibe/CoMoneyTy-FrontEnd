import { Component } from '@angular/core';
import { NavController, ModalController, LoadingController,ToastController } from 'ionic-angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';

import  {ListeEvent} from "../cmy-liste-event/cmy-liste-event";
import {Restangular} from 'ngx-restangular';
import { FacebookLoginService } from '../facebook-login/facebook-login.service';
import { GoogleLoginService } from '../google-login/google-login.service';
import {User,Constante} from "../cmy-model/cmy.model";

@Component({
  selector: 'signup-page',
  templateUrl: 'signup.html',
  providers:[Restangular]
})
export class SignupPage {
  signup: FormGroup;
  main_page: { component: any };
  loading: any;

  constructor(
    public nav: NavController,
    private restangular: Restangular,
    public modal: ModalController,
    public toastCtrl: ToastController,
    public facebookLoginService: FacebookLoginService,
    public googleLoginService: GoogleLoginService,
    public loadingCtrl: LoadingController,
    public constante: Constante
  ) {
    this.main_page = { component: ListeEvent };

    this.signup = new FormGroup({
      email: new FormControl('', Validators.compose([Validators.required,Validators.minLength(5)])),
      phone: new FormControl('', Validators.compose([Validators.required,Validators.minLength(10)])),
      nom: new FormControl('', Validators.compose([Validators.required,Validators.minLength(5)])),
      prenom: new FormControl('', Validators.compose([Validators.required,Validators.minLength(3)])),
      password: new FormControl('', Validators.compose([Validators.required,Validators.minLength(5)])),
      confirm_password: new FormControl('', Validators.compose([Validators.required,Validators.minLength(5)])),
    });
  }
  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }
  doSignup(){
    // Enregistrement du nouveau user
    let user:User = new User();
    user.email = this.signup.get('email').value;
    user.password = this.signup.get("password").value;


    user.nom = this.signup.get('nom').value;
    user.prenom = this.signup.get('prenom').value;
    let passconf = this.signup.get("confirm_password").value;
    if(passconf!=user.password)
    {
      this.presentToast("Les mots de passe sont différents!");
      this.signup.get("confirm_password").markAsDirty();
      return;
    }
    this.loading = this.loadingCtrl.create({
      content: 'Enregistrement...',
    });
    this.loading.present();



    this.restangular.one("user").post("create",user).subscribe(resp => {
      // Ajout à la liste
      this.loading.dismissAll();
      localStorage.removeItem('id_token');
      localStorage.removeItem('user');
      localStorage.setItem('id_token', resp.id);
      localStorage.setItem('user', JSON.stringify(resp.user));
      this.constante.user=resp.user;
      // let component_page : any = { component: ListeEvent };
      this.nav.setRoot(  ListeEvent );
    }, errorResponse => {
      this.constante.traiteErreur(errorResponse,this);
    });

  }

  doFacebookSignup() {
    this.loading = this.loadingCtrl.create();
    // Here we will check if the user is already logged in
    // because we don't want to ask users to log in each time they open the app
    let env = this;

    this.facebookLoginService.getFacebookUser()
      .then(function(data) {
        // user is previously logged with FB and we have his data we will let him access the app
        // data : name, image,userID
        let user:User = new User();
        user.id=data.userId;
        user.email=data.mail;
        if(data.name.indexOf(" ")!=-1) {
          user.nom = data.name.split(" ")[0];
          user.prenom = data.name.split(" ")[1];
        } else {
          user.nom = data.name;
          user.prenom="--";
        }
        user.urlAvatar=data.image;
        // Connexion réel à l'application
        env.restangular.one("user").post("login-facebook",this.user).subscribe(resp => {
          localStorage.setItem('id_token', resp.id);
          localStorage.setItem('user', JSON.stringify(resp.user));
          env.constante.user=resp.user;
          env.nav.setRoot(env.main_page.component);
        }, errorResponse => {
          this.constante.traiteErreur(errorResponse,this);
        });

      }, function(error){
        //we don't have the user data so we will ask him to log in
        env.facebookLoginService.doFacebookLogin()
          .then(function(data){
            env.loading.dismiss();
            let user:User = new User();
            user.id=data.userId;
            user.email=data.email;
            user.urlAvatar=data.image;
            if(data.name.indexOf(" ")!=-1) {
              user.nom = data.name.split(" ")[0];
              user.prenom = data.name.split(" ")[1];
            } else {
              user.nom = data.name;
              user.prenom="--";
            }
            env.restangular.one("user").post("login-facebook",user).subscribe(resp => {
              localStorage.setItem('id_token', resp.id);
              localStorage.setItem('user', JSON.stringify(resp.user));
              env.constante.user=resp.user;
              env.nav.setRoot(env.main_page.component);
            }, errorResponse => {
              this.constante.traiteErreur(errorResponse,this);
            });

          }, function(err){
            this.constante.traiteErreur(err,this);
          });
      });
  }

  doGoogleSignup() {
    this.loading = this.loadingCtrl.create();

    // Here we will check if the user is already logged in because we don't want to ask users to log in each time they open the app
    let env = this;

    this.googleLoginService.trySilentLogin()
    .then(function(data) {
       // user is previously logged with Google and we have his data we will let him access the app
      env.nav.setRoot(env.main_page.component);
    }, function(error){
      //we don't have the user data so we will ask him to log in
      env.googleLoginService.doGoogleLogin()
      .then(function(res){
        env.loading.dismiss();
        env.nav.setRoot(env.main_page.component);
      }, function(err){
        this.constante.traiteErreur(err,this);
        env.loading.dismiss();
      });
    });
  }

  showTermsModal() {
    let modal = this.modal.create(ListeEvent);
    modal.present();
  }

  showPrivacyModal() {
    let modal = this.modal.create(ListeEvent);
    modal.present();
  }

}