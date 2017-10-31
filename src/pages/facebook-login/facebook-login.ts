import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';

import { FacebookUserModel } from './facebook-user.model';
import { FacebookLoginService } from './facebook-login.service';

@Component({
  selector: 'facebook-login-page',
  templateUrl: 'facebook-login.html'
})
export class FacebookLoginPage {
  user: FacebookUserModel = new FacebookUserModel();
  loading: any;

  constructor(
    public nav: NavController,
    public facebookLoginService: FacebookLoginService,
    public loadingCtrl: LoadingController
  ) {
    this.loading = this.loadingCtrl.create();
  }

  ionViewDidLoad(){
    this.loading.present();
    let env = this;

    this.facebookLoginService.getFacebookUser()
    .then(function(user){
      env.user = user;
      env.loading.dismiss();
    }, function(error){
      env.loading.dismiss();
      this.constante.traiteErreur(error,this);
    });
  };

  doFacebookLogout(){
    let env = this;

    this.facebookLoginService.doFacebookLogout()
    .then(function(res) {
      env.user = new FacebookUserModel();
    }, function(error){
      this.constante.traiteErreur(error,this);
    });
  };

  doFacebookLogin() {
    let env = this;

    this.facebookLoginService.doFacebookLogin()
    .then(function(user){
      env.user = user;
    }, function(err){
      this.constante.traiteErreur(err,this);
    });
  };
}
