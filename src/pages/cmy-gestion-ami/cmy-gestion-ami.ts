import {Component, ViewChild} from '@angular/core';
import {LoadingController, ModalController, NavController, NavParams, ToastController} from 'ionic-angular';
import {Constante, Invitation, LienEventUser, User, UserAvecDepense} from '../cmy-model/cmy.model';

import {Restangular} from 'ngx-restangular';
import {InvitationAmi} from "../cmy-invitation-ami/cmy-invitation-ami";
import {ModalChoixEvent} from "../cmy-modal/modal-choix-event";
import {MenuCircular, SousMenu} from "../../components/menu-circular/menu-circular";
import {DetailAmi} from "../cmy-detail-ami/cmy-detail-ami";

//import 'rxjs/Rx';
@Component({
  selector: 'gestion-ami',
  templateUrl: 'cmy-gestion-ami.html',
  providers:[Restangular]
})


export class GestionAmi {
  invitations: Array<Invitation>;
  amis:Array<UserAvecDepense>;
  amisInitial:Array<UserAvecDepense>;
  loading: any;

  visible:boolean = false;
  @ViewChild('menu') menu:MenuCircular;
  constructor(public nav: NavController,public constante:Constante,
    public loadingCtrl: LoadingController,private toastCtrl:ToastController,private modalController:ModalController,private restangular: Restangular,public params: NavParams) {
    this.loading = this.loadingCtrl.create();

  };

  ionViewDidLoad() {
    this.loading.present();
    // récupération de toutes les relations
    this.restangular.all('user/'+this.constante.user.id+'/invitations').getList().subscribe(invits => {
      this.invitations=invits;
      this.loading.dismiss();
    },errorResponse => {
      this.constante.traiteErreur(errorResponse,this);
    });
    this.restangular.all('user/'+this.constante.user.id+'/relationsAvecMontant').getList().subscribe(amis => {
      this.amis=amis;
      this.amisInitial=amis;
      this.loading.dismiss();
    },errorResponse => {
      this.constante.traiteErreur(errorResponse,this);
    });

    let sousmenus:Array<SousMenu> = new Array();
    sousmenus.push(new SousMenu("Affecter",this.affecte,"share-alt"));
    sousmenus.push(new SousMenu("Message",this.message,"send"));
    sousmenus.push(new SousMenu("Detail",this.open,"open"));
    sousmenus.push(new SousMenu("Quitter",this.closeMenu,"close"));
    this.menu.config(sousmenus);
  };


  ajouteInvitation() {
    this.nav.push(InvitationAmi,{'theInvitations':this.invitations});
  };

  message(ami:User)  {
    console.log("Message");
  }
  open(ami:User)
  {

    this.closeMenu();
    this.nav.push(DetailAmi,{'theAmi':ami});
  };

  affecte(ami:User)
  {

    this.closeMenu();
    let modal = this.modalController.create(ModalChoixEvent);
    modal.onDidDismiss(event => {
      if (event == null) {
        return;
      }
      this.loading = this.loadingCtrl.create({
        content: 'Enregistrement...',
      });
      this.loading.present();
      // Il est présnet mais n'était pas là avant
      let lien = this.restangular.copy(new LienEventUser(ami.id,event.id));
      lien.route='lienEventUser';
      lien.save().toPromise().then(rep=>{
        this.loading.dismiss();
      },err=>{
        this.loading.dismiss();
        let toast = this.toastCtrl.create({
          message: "Le user est déjà affecté à cet event!",
          duration: 3000,
          position: 'top'
        });
        toast.present();
      })

    });
    modal.present();
  };
  filtreAmi(ev) {
    console.log('Filtre');
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.amis = this.amisInitial.filter((item) => {
        return (JSON.stringify(item).toLocaleLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    } else {
      this.amis = this.amisInitial;
    }
  };


  showMenu(amiAvecDepense:UserAvecDepense) {
    let ami:User=amiAvecDepense.user;
    this.visible = true;
    this.menu.show(this,ami,ami.urlAvatar);
    this.menu.toggle();
  };
  closeMenu() {
    this.visible = false;
    this.menu.toggle();
    this.menu.close();
  };
  blockEvent() {
    console.log("Il faut bloquer!!!");
//    this.parent.cover.nativeElement.style.display="none";
    this.visible=false;
  };
}
