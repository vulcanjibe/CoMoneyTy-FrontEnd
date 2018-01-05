import {Component} from '@angular/core';
import {
  AlertController,
  LoadingController,
  ModalController,
  NavController,
  NavParams,
  ToastController
} from 'ionic-angular';
import {
  Constante,
  Depense,
  Event,
  Mouvement,
  OperationAvecDepense,
  User,
  UserAvecDepense
} from "../cmy-model/cmy.model";
import {Restangular} from 'ngx-restangular';
import {ListeDocument} from "../cmy-liste-document/cmy-liste-document";

//import 'rxjs/Rx';
@Component({
  selector: 'liste-depense',
  templateUrl: 'cmy-liste-depense.html',
  providers:[Restangular]
})
export class ListeDepense {
  participants: Array<UserAvecDepense>;
  depenses : Array<DepenseAvecUser>;
  paiements : Array<MouvementAvecUser>;
  event: Event;
  loading: any;
  action:any;
  constructor(public nav: NavController,public constante:Constante,
    public loadingCtrl: LoadingController,private restangular: Restangular,public alertController:AlertController,   public toastCtrl: ToastController,private modalController :ModalController,public navParam:NavParams ) {
    this.loading = this.loadingCtrl.create();
    this.event = navParam.get("theEvent");
    this.participants = navParam.get("theParticipants");
  }

  ionViewDidLoad() {
    this.loading.present();
    this.restangular.all('event/'+this.event.id+'/depenses').getList().subscribe(depenses => {
      this.depenses = new Array<DepenseAvecUser>();
      for(let depense of depenses) {
        let dep:DepenseAvecUser = new DepenseAvecUser();
        dep.depense = depense;
        for(let particpant of this.participants)
        {
          if(particpant.user.id==depense.idPayeur)
          {
            dep.user=particpant.user;
            break;
          }
        }
        this.depenses.push(dep);
      }

      this.loading.dismiss();
    },errorResponse => {
      this.loading.dismiss();
      this.constante.traiteErreur(errorResponse,this);
    });
    this.restangular.all('event/'+this.event.id+'/mouvements').getList().subscribe(mouvements   => {
      this.paiements = new Array<MouvementAvecUser>();
      for(let mouvement of mouvements) {
        let mvt: MouvementAvecUser = new MouvementAvecUser();
        mvt.mouvement = mouvement;
        this.paiements.push(mvt);
      }

      for(let mouvement of this.paiements) {
        for(let particpant of this.participants)
        {
          if(particpant.user.id==mouvement.mouvement.idEmetteur)
          {
            mouvement.emetteur=particpant.user;
            break;
          }
        }
      }
      for(let mouvement of this.paiements) {
        for(let particpant of this.participants)
        {
          if(particpant.user.id==mouvement.mouvement.idDestinataire)
          {
            mouvement.destinataire=particpant.user;
            break;
          }
        }
      }
    },errorResponse => {
      this.loading.dismiss();
      this.constante.traiteErreur(errorResponse,this);
    });
  };
  detailDepense(operation:DepenseAvecUser) {

    const alert = this.alertController.create({
      title: 'Modifier cette dépense',
      message: "Voulez-vous :",
      buttons: [
        {
          text: 'Supprimer cette dépense',
          role: 'cancel',
          handler: () => {
            if(operation.depense.idPayeur!=this.constante.user.id)
            {
              let toast = this.toastCtrl.create({
                message: 'Vous ne pouvez pas modifier cette dépense',
                duration: 3000,
                position: 'top'
              });
              toast.present();
              return;
            }
            this.loading = this.loadingCtrl.create({
              content: 'Suppression...',
            });
            this.loading.present();
            // this.operationAvecDepense.depense.remove();
            let newDepense = this.restangular.copy(operation.depense);
            newDepense.route='depense';
            newDepense.remove().toPromise().then(resp=> {
              this.loading.dismissAll();
              console.log("dépense supprimée");
              this.event.montantTotal-=newDepense.montant;
              this.event.montantDepense-=newDepense.montant;
              this.constante.touchEvent(this.event);
              // suppression de la ligne
              for(let i=0;i<this.depenses.length;i++) {
                let dep = this.depenses[i];
                if(dep.depense.id==operation.depense.id)
                {
                  this.depenses.splice(i,1);
                  break;
                }
              }
              // Mise à jour des montant participant
              let montant =  newDepense.montant/this.participants.length;
              for(let participant of this.participants)
                if(participant.user.id!=newDepense.idPayeur)
                  participant.doit-=montant;
                else {
                  participant.aPaye -= newDepense.montant;
                  participant.doit += newDepense.montant - montant;
                }
            }, errorResponse => {
              this.constante.traiteErreur(errorResponse,this);
            });
          }
        },
        {
          text: 'Modifier cette dépense',
          handler: () => {
            let toast = this.toastCtrl.create({
              message: 'Pas encore implémenté petit scarabée!!!',
              duration: 3000,
              position: 'top'
            });
            toast.present();
          }
        },
        {
          text: 'Ne rien faire',
          handler: () => {

          }
        }
      ]
    });
    if(operation.depense.idOperation!=null) {
      alert.addButton( {
        text: 'Voir les documents',
        handler: () => {
          // Lecture de l'opération
          this.restangular.one('operation/'+operation.depense.idOperation).get().subscribe(ope => {
            let operationAvecDepense:OperationAvecDepense  = new OperationAvecDepense();
            operationAvecDepense.operation=ope;
            operationAvecDepense.depense=operation.depense;
            this.nav.push(ListeDocument, {theOperation: operationAvecDepense});
          },errorResponse => {
            this.constante.traiteErreur(errorResponse,this);
          });
        }
      });
    };
    alert.present();
  };


}

class DepenseAvecUser {
  depense: Depense;
  user: User;
}

class MouvementAvecUser {
  mouvement: Mouvement;
  emetteur:User;
  destinataire:User;
}
