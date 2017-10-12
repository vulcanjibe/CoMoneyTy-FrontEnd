import { Component } from '@angular/core';
import {NavController, LoadingController, NavParams, Platform, ToastController} from 'ionic-angular';
import 'rxjs/Rx';

import {Constante, Invitation, Contact, User} from '../cmy-model/cmy.model';


import {Restangular} from 'ngx-restangular';
import {ContactFindOptions, Contacts} from "@ionic-native/contacts";
import {SMS} from "@ionic-native/sms";
@Component({
  selector: 'invitation-ami',
  templateUrl: 'cmy-invitation-ami.html',
  providers:[Restangular]
})


export class InvitationAmi {
  contacts: Array<Contact>;
  contactsComplet: Array<Contact>;
  invitations: Array<Invitation>;
  loading: any;
  constructor(public nav: NavController,public constante:Constante,
    public loadingCtrl: LoadingController,private smsProvider:SMS, private toastCtrl:ToastController,private restangular: Restangular,public params: NavParams, private platform: Platform,private contacts_tel: Contacts) {
    this.loading = this.loadingCtrl.create();
    this.invitations = params.get("theInvitations");

  }

  ionViewDidLoad() {

    if (this.platform.is('mobileweb') || this.platform.is('core')) {
      this.contactsComplet = new Array<Contact>();
      this.loading.present();
      this.restangular.all('user').getList().subscribe(users => {
       for(let usr of users) {
         let user:User = usr;
         let aContact = new Contact(user.nom,user.prenom,user.phone);
         aContact.photo=user.urlAvatar;
         this.contactsComplet.push(aContact);
       }
        this.initContacts();
        this.loading.dismiss();
      },errorResponse => {
        this.loading.dismiss();
        this.constante.traiteErreur(errorResponse,this);
      });
    } else {
      // récupération de toutes les relations
      let options = new ContactFindOptions();
      options.multiple=true;
     // options.desiredFields=[ this.contacts_tel.fieldType.id];
      //options.hasPhoneNumber = true;
      this.loading.present();
      this.contacts_tel.find(["*"],options).then(res=>{
        console.log(res.length);
        this.contactsComplet=new Array<Contact>();
       for(let cont of res)
       {

         let aContact = new Contact("","","");
         aContact.displayName=cont.displayName;
         aContact.idInterne = cont.id;
         aContact.phoneNumber = "";
         if(cont.phoneNumbers!=null) {
           for (let obj1 of cont.phoneNumbers) {
             if (obj1.pref)
               aContact.phoneNumber = obj1.value;
           }
           if (aContact.phoneNumber == "" && cont.phoneNumbers.length > 0)
             aContact.phoneNumber = cont.phoneNumbers[0].value;
         }
         aContact.email = "";
         if(cont.emails!=null) {
           for (let obj1 of cont.emails) {
             if (obj1.pref)
               aContact.email = obj1.value;
           }
           if (aContact.email == "" && cont.emails.length > 0)
             aContact.email = cont.emails[0].value;
         }

         aContact.photo = "";
         if(cont.photos!=null) {
           for (let obj1 of cont.photos) {
             if (obj1.pref)
               aContact.photo = obj1.value;
           }
           if (aContact.photo == "" && cont.photos.length > 0)
             aContact.photo = cont.photos[0].value;
         }
         if (aContact.photo == "")
          aContact.photo = "user/inconnu.png";
         this.contactsComplet.push(aContact);

       }
       this.initContacts();
       this.loading.dismissAll();
      },err=>{
        this.constante.traiteErreur(err,this);
      });
    }

  }

  initContacts() {
    this.contacts = new Array<Contact>();
    for(let contact of this.contactsComplet) {
      contact.dejaInvite=false;
      for(let invite of this.invitations)
      {
        if(invite.contact.idInterne==contact.idInterne) {
          contact.dejaInvite = true;
          break;
        }
      }
      this.contacts.push(contact);
    }
  }
  envoiInvitation(contact:Contact) {


    if(contact.dejaInvite)
    {
      let toast = this.toastCtrl.create({
        message: "Cet ami a déjà été invité!",
        duration: 3000,
        position: 'top'
      });
      toast.present();
      return;
    }

    if (!(this.platform.is('mobileweb') || this.platform.is('core'))) {
      let options = {
        replaceLineBreaks: false,
        android: {
          intent: ''
        }
      }
      let message = this.constante.user.prenom + " t'invite sur CoMoneyTy. Click sur le lien ci-dessous pour obtenir l'app : https://lc.cx/puiU";
      this.smsProvider.send(contact.phoneNumber, message, options).then(rep => {
        let toast = this.toastCtrl.create({
          message: "Demande transmise!",
          duration: 3000,
          position: 'top'
        });
        toast.present();
      }, err => {
        console.log("Error : " + err);
      })
    }
    console.log("invitation...");
    let invitation = new Invitation();
    invitation.etatReponse="Invitation envoyée";
    invitation.idUser=this.constante.user.id;
    invitation.contact=contact;
    let invit = this.restangular.copy(invitation);
    invit.route='invitation';
    this.loading = this.loadingCtrl.create();
    this.loading.present();
    invit.save().toPromise().then(resp=> {
      this.loading.dismissAll();
      contact.dejaInvite=true;
      this.invitations.push(resp);
    }, errorResponse => {
      this.constante.traiteErreur(errorResponse,this);
    });

  }

  filtreContact(ev) {
    console.log('Filtre');
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.contacts = this.contactsComplet.filter((item) => {
        return (JSON.stringify(item).toLocaleLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    } else {
      this.contacts = this.contactsComplet;
    }
  }
}
