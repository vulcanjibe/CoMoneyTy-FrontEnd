import { Component, ViewChild } from '@angular/core';
import { NavController, Slides } from 'ionic-angular';

import { LoginPage } from '../login/login';
import { SignupPage } from '../signup/signup';
import {Restangular} from 'ngx-restangular';
import { User,Constante} from '../cmy-model/cmy.model'
import { ListeEvent } from '../cmy-liste-event/cmy-liste-event';
import { Facebook } from '@ionic-native/facebook';
import { AppVersion } from '@ionic-native/app-version';
@Component({
  selector: 'walkthrough-page',
  templateUrl: 'walkthrough.html'
})
export class WalkthroughPage {
  FB_APP_ID: number = 826720427470540;
  lastSlide = false;
  version1:string;
  version2:string;
  userDev : User;
  @ViewChild('slider') slider: Slides;

  constructor(private appVersion: AppVersion,public nav: NavController, private restangular: Restangular,public constante: Constante,public fb: Facebook) {
    this.fb.browserInit(this.FB_APP_ID, "v2.8");
    this.appVersion.getVersionCode().then(rep=> {
      this.version1=rep;
    },error => {
      this.version1="--";
      console.log(error);
    });
    this.appVersion.getVersionNumber().then(rep=> {
      this.version1=rep;
    },error => {
      this.version2="--";
    });
  }

  skipIntro() {
    // You can skip to main app
    // this.nav.setRoot(TabsNavigationPage);

    // Or you can skip to last slide (login/signup slide)
    this.lastSlide = true;
    this.slider.slideTo(this.slider.length());
  }
  facebookTest()
  {
    let env = this;

      //["public_profile"] is the array of permissions, you can add more if you need
      this.fb.login(["public_profile"]).then(function(response){
        //Getting name and gender properties
        let request:string = "/me?fields=name,gender,email";
        env.fb.api(request, [])
          .then(function(user) {
            //now we have the users info, let's save it in the NativeStorage
            console.log(user);
          }, function(error){
            console.log(error);
          });
        request="/me/friendlists";
        env.fb.api(request, [])
          .then(function(user) {
            //now we have the users info, let's save it in the NativeStorage
            console.log(user);
          }, function(error){
            console.log(error);
          });
        request="/me/friends";
        env.fb.api(request, [])
          .then(function(user) {
            //now we have the users info, let's save it in the NativeStorage
            console.log(user);
          }, function(error){
            console.log(error);
          });

      }, function(error){
        console.log(error);
      });

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
