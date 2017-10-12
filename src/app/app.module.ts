import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import {Contacts} from "@ionic-native/contacts";
import { List2EventPage } from '../pages/cmy-liste-event/cmy-liste-event';
import { ListeOperation } from '../pages/cmy-liste-operation/cmy-liste-operation';
import { CreationEventPage } from '../pages/cmy-creation-event/cmy-creation-event';
import { CreationMouvementPage } from '../pages/cmy-creation-mouvement/cmy-creation-mouvement';
import { DetailEventPage } from '../pages/cmy-detail-event/cmy-detail-event';
import { AjoutParticipantPage } from '../pages/cmy-ajout-participant/cmy-ajout-participant';
import { ListeDepense} from "../pages/cmy-liste-depense/cmy-liste-depense";
import {ModalPhoto} from  '../pages/cmy-modal/modal-photo';
import {ModalChoixEvent} from  '../pages/cmy-modal/modal-choix-event';
import {Constante, Message} from '../pages/cmy-model/cmy.model';
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
import { NativeStorage } from '@ionic-native/native-storage';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Facebook } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';
import { Keyboard } from '@ionic-native/keyboard';
import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { FilePath } from '@ionic-native/file-path';

// Functionalities

import { FacebookLoginPage } from '../pages/facebook-login/facebook-login';
import { GoogleLoginPage } from '../pages/google-login/google-login';

import { FacebookLoginService } from '../pages/facebook-login/facebook-login.service';
import { GoogleLoginService } from '../pages/google-login/google-login.service';

import { RestangularModule } from 'ngx-restangular';
import {DetailOperation} from "../pages/cmy-detail-operation/cmy-detail-operation";
import {ModalChoixOperation} from "../pages/cmy-modal/modal-choix-operation";
import { Transfer } from '@ionic-native/transfer';
import { SMS } from '@ionic-native/sms';
import {GestionAmi} from "../pages/cmy-gestion-ami/cmy-gestion-ami";
import {InvitationAmi} from "../pages/cmy-invitation-ami/cmy-invitation-ami";
import {ListeMessage} from "../pages/cmy-list-message/cmy-liste-message";
import {GestionProfile} from "../pages/cmy-gestion-profile/cmy-gestion-profile";
import {BilanEvent} from "../pages/cmy-bilan-event/cmy-bilan-event";

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
    BilanEvent,
    GestionProfile,
    CreationMouvementPage,
    DetailOperation,
    ListeDepense,
    GestionAmi,
    InvitationAmi,
    ListeMessage,
    AjoutParticipantPage,
    ModalPhoto,
    ModalChoixEvent,
    ModalChoixOperation,
    CreationEventPage,
    List2EventPage,
    ListeOperation,
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
    GestionProfile,
    ListeMessage,
    BilanEvent,
    List2EventPage,
    DetailOperation,
    ListeDepense,
    GestionAmi,
    ListeOperation,
    ListeMessage,
    CreationEventPage,
    CreationMouvementPage,
    DetailEventPage,
    InvitationAmi,
    AjoutParticipantPage,
    ModalPhoto,
    ModalChoixEvent,
    ModalChoixOperation,
    LoginPage,
    WalkthroughPage,
    ForgotPasswordPage,
    SignupPage,
    FacebookLoginPage,
    GoogleLoginPage,
  ],
  providers: [
    SMS,
    Constante,
    FacebookLoginService,
    GoogleLoginService,
    Camera,
    Contacts,
    File,
    FilePath,
    Transfer,
	  SplashScreen,
	  StatusBar,
    NativeStorage,
    InAppBrowser,
    Facebook,
    GooglePlus,
    Keyboard
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule {}
