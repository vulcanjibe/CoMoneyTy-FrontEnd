import { Component, ViewChild } from '@angular/core';
import { NavController, Slides } from 'ionic-angular';

import { LoginPage } from '../login/login';
import { SignupPage } from '../signup/signup';
import {Restangular} from 'ngx-restangular';
import { User,Constante} from '../cmy-model/cmy.model'
import { TabsNavigationPage } from '../tabs-navigation/tabs-navigation';
@Component({
  selector: 'walkthrough-page',
  templateUrl: 'walkthrough.html'
})
export class WalkthroughPage {

  lastSlide = false;
  userDev : User;
  @ViewChild('slider') slider: Slides;

  constructor(public nav: NavController, private restangular: Restangular,public constante: Constante) {

  }

  skipIntro() {
    // You can skip to main app
    // this.nav.setRoot(TabsNavigationPage);

    // Or you can skip to last slide (login/signup slide)
    this.lastSlide = true;
    this.slider.slideTo(this.slider.length());
  }

  skipDevIntro() {
    localStorage.removeItem('id_token');
    localStorage.removeItem('user');
    this.userDev  = new User();
    this.userDev.login="Herve";
    this.userDev.password="CoMoneyTy";
    this.restangular.one("user").post("login",this.userDev).subscribe(resp => {
      localStorage.setItem('id_token', resp.id);
      localStorage.setItem('user', JSON.stringify(resp.user));
      this.constante.user=resp.user;
      this.nav.setRoot(TabsNavigationPage);
    }, errorResponse => {
      console.log("Error with status code", errorResponse.status);
    });
  }
  onSlideChanged() {
    // If it's the last slide, then hide the 'Skip' button on the header
    this.lastSlide = this.slider.isEnd();
  }

  goToLogin() {
    this.nav.push(LoginPage);
  }

  goToSignup() {
    this.nav.push(SignupPage);
  }
}
