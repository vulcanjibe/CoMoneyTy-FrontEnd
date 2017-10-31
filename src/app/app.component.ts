import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav, App } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { WalkthroughPage } from '../pages/walkthrough/walkthrough';
import {ListeEvent} from '../pages/cmy-liste-event/cmy-liste-event';
import { ListeOperation } from '../pages/cmy-liste-operation/cmy-liste-operation';
import {GestionAmi} from "../pages/cmy-gestion-ami/cmy-gestion-ami";
import {ListeMessage} from "../pages/cmy-list-message/cmy-liste-message";
import {GestionProfile} from "../pages/cmy-gestion-profile/cmy-gestion-profile";
import {PageTest} from "../pages/cmy-page-test/cmy-page-test";
import {ListeOrdre} from "../pages/cmy-liste-ordre/cmy-liste-ordre";
import {Restangular} from 'ngx-restangular';
import {Constante} from "../pages/cmy-model/cmy.model";
@Component({
  selector: 'app-root',
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;

  // make WalkthroughPage the root (or first) page
  rootPage: any = WalkthroughPage;
  // rootPage: any = TabsNavigationPage;

  nbMessage:number=0;
  pages: Array<{title: string, icon: string, component: any}>;
  pushPages: Array<{title: string, icon: string, component: any}>;

  constructor(
    platform: Platform,
    public menu: MenuController,
    public app: App,
    public splashScreen: SplashScreen,
    public statusBar: StatusBar,private restangular: Restangular,private constante:Constante
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.splashScreen.hide();
      this.statusBar.styleDefault();
    });

    this.pages = [
      { title: 'Home', icon: 'home', component: ListeEvent },
      { title: 'Event', icon: 'people', component: ListeEvent },
      { title: 'Operation', icon: 'swap', component: ListeOperation },
      { title: 'Ordres', icon: 'cash', component: ListeOrdre },
      { title: 'Message', icon: 'mail', component: ListeMessage },
      { title: 'Amis', icon: 'people', component: GestionAmi },
      { title: 'Dev Only!', icon: 'bug', component: PageTest }
    ];

    this.pushPages = [
      { title: 'Profile', icon: 'settings', component: GestionProfile }

    ];

    // Lancement de la messagerie
    let that = this;
    setInterval(() => {
      that.refreshMessagerie();
    }, 60000);
  }


  public refreshMessagerie() {
    ///console.log("Salut mec!");
  this.restangular.one('user/'+this.constante.user.id+'/nbMessagesNonLu').get().subscribe(rep => {
    this.nbMessage  = rep.message.split("=")[1];
    },errorResponse => {
      this.constante.traiteErreur(errorResponse,this);
    });
  }

  openPage(page) {
    // close the menu when (tap)ing a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  }

  pushPage(page) {
    // close the menu when (tap)ing a link from the menu
    this.menu.close();
    // rootNav is now deprecated (since beta 11) (https://forum.ionicframework.com/t/cant-access-rootnav-after-upgrade-to-beta-11/59889)
    this.app.getRootNav().push(page.component);
  }
}
