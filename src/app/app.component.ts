import { Component, ViewChild } from '@angular/core';
import {Platform, MenuController, Nav, App, AlertController, IonicApp} from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { WalkthroughPage } from '../pages/walkthrough/walkthrough';
import {ListeEvent} from '../pages/cmy-liste-event/cmy-liste-event';
import { ListeOperation } from '../pages/cmy-liste-operation/cmy-liste-operation';
import {GestionAmi} from "../pages/cmy-gestion-ami/cmy-gestion-ami";
import {ListeMessage} from "../pages/cmy-list-message/cmy-liste-message";
import {GestionProfile} from "../pages/cmy-gestion-profile/cmy-gestion-profile";
import {PageTest} from "../pages/cmy-page-test/cmy-page-test";
import {Restangular} from 'ngx-restangular';
import {Constante} from "../pages/cmy-model/cmy.model";
import {Home} from "../pages/cmy-home/cmy-home";
import {ClavierVirtuel} from "../pages/cmy-clavier-virtuel/cmy-clavier-virtuel";
import { Badge } from '@ionic-native/badge';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;

  // make WalkthroughPage the root (or first) page
  rootPage: any;// = WalkthroughPage;
  // rootPage: any = TabsNavigationPage;
  background:boolean=false;
  nbMessage:number=0;
  pages: Array<{title: string, icon: string, component: any}>;
  pushPages: Array<{title: string, icon: string, component: any}>;
  ionicApp: IonicApp;
  timer:any;
  constructor(

    private platform: Platform,
    public menu: MenuController,
    public app: App,private alertCtrl: AlertController,
    public splashScreen: SplashScreen,
    public statusBar: StatusBar,private restangular: Restangular,private constante:Constante,private badge: Badge) {
    platform.pause.subscribe(rep => {
      this.background = true;
      clearTimeout(this.timer);
      let that=this;
      this.timer = setInterval(() => {
        that.refreshMessagerie();
      }, 600000);

    });
    platform.resume.subscribe(rep => {
      this.background = false;
      clearTimeout(this.timer);
      this.refreshMessagerie();
      let that=this;
      this.timer = setInterval(() => {
        that.refreshMessagerie();
      }, 180000);

    });

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.splashScreen.hide();
      this.statusBar.styleDefault();
      let codecourt = localStorage.getItem("codecourt");
      if(codecourt !=null && codecourt!="----" && codecourt!="") {
        this.rootPage= ClavierVirtuel;
      } else {
        this.rootPage= WalkthroughPage;
      }
      this.ionicApp = this.app._appRoot;
      this.platform.registerBackButtonAction(() => {
        let activePortal = this.ionicApp._loadingPortal.getActive() ||
          this.ionicApp._modalPortal.getActive() ||
          this.ionicApp._toastPortal.getActive() ||
          this.ionicApp._overlayPortal.getActive();

        if (activePortal) {
          // ready = false;
          activePortal.dismiss();
          activePortal.onDidDismiss(() => {  });

          console.log("handled with portal");
          return;
        }
        if(this.nav.length()==1)
            this.confirmExit();
        else this.nav.pop();

      });


    });
    this.constante.userChange.subscribe(event => {
      if(this.constante.user==null)
        return;
      if(this.constante.user.phone==null) {
        const alert = this.alertCtrl.create({
          title: 'Votre profil est incomplet... Rajoutez votre numéro de téléphone pour rejoindre vos amis.',
          message: "Voulez-vous compléter votre profil maintenant?",
          buttons: [
            {
              text: 'Oui',
              role: 'cancel',
              handler: () => {
                // Transofrmation de l'invit en relation
                this.app.getRootNav().push(GestionProfile);
              }
            },
            {
              text: 'Non',
              handler: () => {

              }
            }

          ]
        });
        alert.present();
      }
      console.log("user logged in!!!");
      // Lancement de la messagerie
      let that = this;
      this.refreshMessagerie();
      this.timer = setInterval(() => {
        that.refreshMessagerie();
      }, 180000);

    });

    this.pages = [
      { title: 'Home', icon: 'home', component: Home },
      { title: 'Event', icon: 'people', component: ListeEvent },
      { title: 'Operation', icon: 'swap', component: ListeOperation },
    //  { title: 'Ordres', icon: 'cash', component: ListeOrdre },
      { title: 'Message', icon: 'mail', component: ListeMessage },
      { title: 'Amis', icon: 'people', component: GestionAmi },
      { title: 'Dev Only!', icon: 'bug', component: PageTest }
    ];

    this.pushPages = [
      { title: 'Profile', icon: 'settings', component: GestionProfile }

    ];

  };

  public confirmExit() {
    let alert = this.alertCtrl.create({
      title : "Quitter CoMoneyTy?",
      message : "Etes-vous sûr de voir quitter CoMoneyTy?",
      buttons : [
        {
          text : "Annuler",
          handler : () => {
            return;
          }
        }, {
          text : "OK",
          handler : () => {
            this.platform.exitApp();
          }
        }
      ]});
    alert.present();
  };

  public refreshMessagerie() {
    ///console.log("Salut mec!");
    if(this.background)
      return;
    if(this.constante.user==null || this.constante.user.id==null) {
      console.log("Not logged");
      return;
    }

    this.restangular.one('user/'+this.constante.user.id+'/nbMessagesNonLu').get().subscribe(rep => {
      let newNb = rep.message.split("=")[1];
      if(this.nbMessage != newNb) {
        this.nbMessage = newNb;
        this.badge.set(this.nbMessage);
      }
      },errorResponse => {
        this.constante.traiteErreur(errorResponse,this);
      });
  };

  openPage(page) {
    // close the menu when (tap)ing a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  };

  pushPage(page) {
    // close the menu when (tap)ing a link from the menu
    this.menu.close();
    // rootNav is now deprecated (since beta 11) (https://forum.ionicframework.com/t/cant-access-rootnav-after-upgrade-to-beta-11/59889)
    this.app.getRootNav().push(page.component);
  };
}
