
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ToastController} from "ionic-angular";
import {Injectable} from "@angular/core";

@Injectable()
export class Constante {
  readonly BASE_URL_REST:string = 'http://vulcanjibe.ddns.net:8080/CoMoneyTy-0.0.1-SNAPSHOT/rest';
  readonly BASE_URL_IMAGE:string = 'http://vulcanjibe.ddns.net:8080/Image';
 // readonly REP_IMAGE:string = 'assets/images/';
  user:User;
  event:Event;
  userChange : BehaviorSubject<User> = new BehaviorSubject(this.user);
  eventChange: BehaviorSubject<Event> = new BehaviorSubject(this.event);
  constructor(private toastCtrl:ToastController) {

  }
  touchEvent(newEvent:Event)
  {
    this.event = newEvent;
    this.eventChange.next(newEvent);
  }
  login(newUser:User)
  {
    this.user = newUser;
    this.userChange.next(newUser);
  }
  logout()
  {
    //this.user = newUser;
    this.user.nom="....";
    this.userChange.next(this.user);
  }

  getUrlImage(url:string)
  {
    if(url.startsWith("http"))
      return url;
    if(url.startsWith("content:"))
      return url;
    return this.BASE_URL_IMAGE+"/"+url;
  }

  public presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }
  traiteErreur(error,component:any) {
    console.log("ERREUR=>",error);
    if(component.loading!=null)
      component.loading.dismissAll();
    let msg = "Une erreur technique est survenue!!!";
    if(error.data && error.data.message) {
      msg = error.data.message;
    }

    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

}

export class User {
   id: string;
   nom: string;
   prenom: string;
   login: string;
   password: string;
   email: string;
   phone: string;
   urlAvatar: string;
   iban:string;
}

export class UserAvecDepense {
  user:User;
  aPaye:number;
  doit:number;
  roles:Array<string>;
  constructor( user1:User) {
    this.user=user1;
    this.aPaye=0;
    this.doit=0;
  }
}

export class Invitation {
  id: string;
  idUser: string;
  date: string;
  etatReponse: string;
  contact: Contact;
}

export class Event {
  id: string;
  libelle: string;
  etat:string;
  date: string;
  roles:Array<string>;
  montantTotal: number;
  montantDu: number;
  montantDepense: number;
  urlPhoto: string;
}

export class LienEventUser {
  id:string;
  userId:string;
  eventId:string;
  roles:Array<String>;
  constructor(id1:string,id2:string) {
    this.userId=id1;
    this.eventId=id2;
  }
}

export class Mouvement {
  id:string;
  idEmetteur:string;
  idDestinataire:string;
  idEvent:string;
  commentaire:string;
  montant:number;
  date:Date;
  etat:string;
  constructor(idEmet:string,idEv:string) {
    this.idEmetteur=idEmet;
    this.idEvent=idEv
  }
}

export class Depense {
  id:string;
  idPayeur:string;
  idEvent:string;
  commentaire:string;
  montant:number;
  typeRepartition:string;
  urlPhoto:string;
  date:string;
  idOperation:string;
  constructor(idPay:string,idEv:string) {
    this.idPayeur=idPay;
    this.idEvent=idEv
  }
}
export class TypeOperation {
  id:number;
  libelle:string;
}
export class Operation {
  id:string;
  userId:string;
  date:string;
  description:string;
  montant:number;
  ibanEmetteur:string;
  ibanDestinataire:string;
  typeOperation:TypeOperation;
  urlPhotoEmetteur:string;
  urlPhotoDestinataire:string;
}


export class OperationAvecDepense {
  operation:Operation;
  urlPhoto:string;
  depense:Depense;
}
export class Contact {
  idInterne:string;
  dejaInvite:boolean;
  displayName:string;
  phoneNumber:string;
  email:string;
  photo:string;

  constructor(nom,prenom,phone) {
    this.idInterne=nom+"."+prenom;
    this.email=nom+"."+prenom+"@gmail.com";
    this.phoneNumber="06 82 66 79 21";
    this.displayName=nom+" "+prenom;
    this.photo="user/inconnu.png";
  }
}


export class Message {
  id:string;
  message: string;
  titre: string;
  emetteur: User;
  destinataire: User;
  messageCache: any;
  date: Date;
  dejaLu:boolean;
  actionRealise:boolean;
}

export class TableauOperation {
  titre: string;
  tableau:Array<OperationAvecDepense>;
}
export class TableauMessage {
  titre: string;
  tableau:Array<Message>;
}

export class Ordre {
  mouvement:Mouvement;
  emetteur:User;
  event:Event;
}

export class Historique {
  idEvent:string;
  user:User;
  timestamp:Date;
  action:string;
  objet:any;
}
