import {Component} from '@angular/core';
import {LoadingController, NavController} from 'ionic-angular';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {SignupPage} from '../signup/signup';
import {ForgotPasswordPage} from '../forgot-password/forgot-password';

import {FacebookLoginService} from './facebook-login.service';
import {GoogleLoginService} from './google-login.service';

import {Restangular} from 'ngx-restangular';
import {Constante, User} from '../cmy-model/cmy.model'
import {PrivacyPolicyPage} from "../privacy-policy/privacy-policy";
import {FacebookUserModel} from "../cmy-model/facebook-user.model";
import {GoogleUserModel} from "../cmy-model/google-user.model";
import CryptoJS from 'crypto-js';
import {MasterHome} from "../master/master-home";

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
  private CryptoJS: any;

  constructor(
    public nav: NavController,
    public facebookLoginService: FacebookLoginService,
    public googleLoginService: GoogleLoginService,
    public loadingCtrl: LoadingController,
    private restangular: Restangular,
    public constante: Constante

  ) {
    this.main_page = { component: MasterHome };
    this.user = new User();
    this.login = new FormGroup({
      email: new FormControl('', Validators.compose([Validators.required,Validators.minLength(3)])),
      password: new FormControl('', Validators.compose([Validators.required,Validators.minLength(5)]))
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
      if(resp.user.codecourt!=null && resp.user.codecourt.length>0) {
        let derivedKey = CryptoJS.PBKDF2(resp.user.codecourt, "AlwaysTheSameSalt", {
          keySize: 512 / 32,
          iterations: 5
        }).toString();
        localStorage.setItem("codecourt", derivedKey);
      }
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
      env.loggue_fb(data);

    }, function(error) {
      //we don't have the user data so we will ask him to log in
      env.facebookLoginService.doFacebookLogin()
        .then(function (data) {
          env.loading.dismiss();
          env.loggue_fb(data);
        }, function(err){
          env.constante.traiteErreur(err,env);
          env.facebookLoginService.doFacebookLogout().then(response=>{
            console.log("cookie facebook effacé")
          },error => {

          });
        });
    });
  };

   loggue_fb(data:FacebookUserModel) {
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
      this.restangular.one("user").post("login-facebook",user).subscribe(resp => {
        localStorage.setItem('id_token', resp.id);
        localStorage.setItem('user', JSON.stringify(resp.user));
        if(resp.user.codecourt!=null && resp.user.codecourt.length>0) {
          let derivedKey = CryptoJS.PBKDF2(resp.user.codecourt, "AlwaysTheSameSalt", {
            keySize: 512 / 32,
            iterations: 5
          }).toString();
          localStorage.setItem("codecourt", derivedKey);
        }
        this.constante.user=resp.user;
        this.constante.login(resp.user);
        this.nav.setRoot(this.main_page.component);
      }, errorResponse => {
        this.constante.traiteErreur(errorResponse,this);
      });

    }
  loggue_google(data:GoogleUserModel) {
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
    this.restangular.one("user").post("login-google",user).subscribe(resp => {
      localStorage.setItem('id_token', resp.id);
      localStorage.setItem('user', JSON.stringify(resp.user));
      if(resp.user.codecourt!=null && resp.user.codecourt.length>0) {
        let derivedKey = CryptoJS.PBKDF2(resp.user.codecourt, "AlwaysTheSameSalt", {
          keySize: 512 / 32,
          iterations: 5
        }).toString();
        localStorage.setItem("codecourt", derivedKey);
      }
      this.constante.user=resp.user;
      this.nav.setRoot(this.main_page.component);
    }, errorResponse => {
      this.constante.traiteErreur(errorResponse,this);
    });

  }

  doGoogleLogin() {
    this.loading = this.loadingCtrl.create();

    // Here we will check if the user is already logged in because we don't want to ask users to log in each time they open the app
    let env = this;

    this.googleLoginService.trySilentLogin()
    .then(function(data:GoogleUserModel) {
       // user is previously logged with Google and we have his data we will let him access the app
      env.loggue_google(data);
    }, function(error){
      //we don't have the user data so we will ask him to log in
      env.googleLoginService.doGoogleLogin()
      .then(function(res:GoogleUserModel){
        env.loading.dismiss();
        env.loggue_google(res);
      }, function(err){
        env.constante.traiteErreur(err,env);
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
