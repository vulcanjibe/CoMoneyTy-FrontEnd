import {Component, ViewChild} from '@angular/core';
import {NavController, Slides} from 'ionic-angular';

import {LoginPage} from '../login/login';
import {SignupPage} from '../signup/signup';
import {Restangular} from 'ngx-restangular';
import {Constante, User} from '../cmy-model/cmy.model'
import {ListeEvent} from '../cmy-liste-event/cmy-liste-event';


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
      this.constante.login(resp.user);
      this.nav.setRoot(ListeEvent);
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

  fileChange(event) {
    let fileList: FileList = event.target.files;

      let file: File = fileList[0];
      var fd = new FormData();
      fd.append('file', file);
      this.restangular.one('event').post('upload',fd).subscribe(resp => {
        console.log(resp);
      },error => {
        console.log(error);
      })
  }
}
