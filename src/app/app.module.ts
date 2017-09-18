import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';

import { List2EventPage } from '../pages/cmy-liste-event/cmy-liste-event';
import { CreationEventPage } from '../pages/cmy-creation-event/cmy-creation-event';
import { DetailEventPage } from '../pages/cmy-detail-event/cmy-detail-event';
import { AjoutParticipantPage } from '../pages/cmy-ajout-participant/cmy-ajout-participant';
import {ModalPhoto} from  '../pages/cmy-modal/modal-photo'
import {Constante} from '../pages/cmy-model/cmy.model';
import { LoginPage } from '../pages/login/login';

import { SignupPage } from '../pages/signup/signup';
import { ForgotPasswordPage } from '../pages/forgot-password/forgot-password';

import { PreloadImage } from '../components/preload-image/preload-image';
import { BackgroundImage } from '../components/background-image/background-image';
import { ShowHideContainer } from '../components/show-hide-password/show-hide-container';
import { ShowHideInput } from '../components/show-hide-password/show-hide-input';
import { ColorRadio } from '../components/color-radio/color-radio';
import { WalkthroughPage } from '../pages/walkthrough/walkthrough';




import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { SocialSharing } from '@ionic-native/social-sharing';
import { NativeStorage } from '@ionic-native/native-storage';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { CallNumber } from '@ionic-native/call-number';
import { Facebook } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';
import { Keyboard } from '@ionic-native/keyboard';
import { EmailComposer } from '@ionic-native/email-composer';
import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { FilePath } from '@ionic-native/file-path';

// Functionalities

import { FacebookLoginPage } from '../pages/facebook-login/facebook-login';
import { GoogleLoginPage } from '../pages/google-login/google-login';

import { FacebookLoginService } from '../pages/facebook-login/facebook-login.service';
import { GoogleLoginService } from '../pages/google-login/google-login.service';

import { RestangularModule } from 'ngx-restangular';


import { Transfer } from '@ionic-native/transfer';
// Function for setting the default restangular configuration

export function RestangularConfigFactory (RestangularProvider) {
  RestangularProvider.setBaseUrl('http://vulcanjibe.ddns.net:8080/CoMoneyTy-0.0.1-SNAPSHOT/rest');
  // set static header
  RestangularProvider.setDefaultHeaders({'Authorization': 'Bearer UDXPx-Xko0w4BRKajozCVy20X11MRZs1'});

  // by each request to the server receive a token and update headers with it
  RestangularProvider.addFullRequestInterceptor((element, operation, path, url, headers, params) => {
    let bearerToken = localStorage.getItem('id_token');
    console.log("TOKEN = "+bearerToken);
    return {
      headers: Object.assign({}, headers, {Authorization: `TOKEN=${bearerToken}`})
    };
  });
}


@NgModule({
  declarations: [
    MyApp,
    DetailEventPage,
    AjoutParticipantPage,
    ModalPhoto,
    CreationEventPage,
    List2EventPage,
    LoginPage,
    SignupPage,
    ForgotPasswordPage,
    WalkthroughPage,
    FacebookLoginPage,
    GoogleLoginPage,
    PreloadImage,
    BackgroundImage,
    ShowHideContainer,
    ShowHideInput,
    ColorRadio
  ],
  imports: [
    BrowserModule,
    HttpModule,
    RestangularModule.forRoot(RestangularConfigFactory),
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    List2EventPage,
    CreationEventPage,
    DetailEventPage,
    AjoutParticipantPage,
    ModalPhoto,
    LoginPage,
    WalkthroughPage,
    ForgotPasswordPage,
    SignupPage,
    FacebookLoginPage,
    GoogleLoginPage,
  ],
  providers: [
    Constante,
    FacebookLoginService,
    GoogleLoginService,
    Camera,
    File,
    FilePath,
    Transfer,
	  SplashScreen,
	  StatusBar,
    SocialSharing,
    NativeStorage,
    InAppBrowser,
    CallNumber,
    Facebook,
    GooglePlus,
    Keyboard,
    EmailComposer
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule {}
