import { Component } from '@angular/core';
import {NavController, LoadingController, ToastController} from 'ionic-angular';
import {Validators, FormGroup, FormControl} from '@angular/forms';

import  {ListeEvent} from "../cmy-liste-event/cmy-liste-event";
import { SignupPage } from '../signup/signup';
import { ForgotPasswordPage } from '../forgot-password/forgot-password';

import { FacebookLoginService } from '../facebook-login/facebook-login.service';
import { GoogleLoginService } from '../google-login/google-login.service';

import {Restangular} from 'ngx-restangular';
import { User,Constante} from '../cmy-model/cmy.model'
import {PrivacyPolicyPage} from "../privacy-policy/privacy-policy";

@Component({
  selector: 'login-page',
  templateUrl: 'login.html',
  providers:[Restangular]
})
export class LoginPage {
  user:User;
  login: FormGroup;
  main_page: { component: any };
  loading: any;


  constructor(
    public nav: NavController,
    public facebookLoginService: FacebookLoginService,
    public googleLoginService: GoogleLoginService,
    public loadingCtrl: LoadingController,
    private restangular: Restangular,
    public constante: Constante,
    private toastCtrl:ToastController
  ) {
    this.main_page = { component: ListeEvent };
    this.user = new User();
    this.login = new FormGroup({
      email: new FormControl('', Validators.compose([
        Validators.required])),
      password: new FormControl('', Validators.required)
    });
  }

  doLogin(){
    this.user.email = this.login.get('email').value;
    this.user.login = this.login.get('email').value;
    this.user.password = this.login.get('password').value;
    localStorage.removeItem('id_token');
    localStorage.removeItem('user');
    this.restangular.one("user").post("login",this.user).subscribe(resp => {
      localStorage.setItem('id_token', resp.id);
      localStorage.setItem('user', JSON.stringify(resp.user));
      this.constante.login(resp.user);
      this.nav.setRoot(this.main_page.component);
    }, errorResponse => {
      this.constante.traiteErreur(errorResponse,this);
    });


  }

  doFacebookLogin() {
    this.loading = this.loadingCtrl.create();

    // Here we will check if the user is already logged in because we don't want to ask users to log in each time they open the app
    let env = this;

    this.facebookLoginService.getFacebookUser()
    .then(function(data) {
       // user is previously logged with FB and we have his data we will let him access the app
      // data : name, image,userID
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
      // Connexion réel à l'application
      env.restangular.one("user").post("login-facebook",user).subscribe(resp => {
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
        if(data.name.indexOf(" ")!=-1) {
          user.nom = data.name.split(" ")[0];
          user.prenom = data.name.split(" ")[1];
        } else {
          user.nom = data.name;
          user.prenom="--";
        }
        user.urlAvatar=data.image;
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

  doGoogleLogin() {
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
      });
    });
  }


  goToSignup() {
    this.nav.push(SignupPage);
  }

  goToForgotPassword() {
    this.nav.push(ForgotPasswordPage);
  }

  showPrivacy() {
    this.nav.push(PrivacyPolicyPage);
  }
}