import {Component, ViewChild} from '@angular/core';
import {LoadingController, ModalController, NavController} from 'ionic-angular';
import {Constante, Depense, OperationAvecDepense, TableauOperation} from "../cmy-model/cmy.model";

import {DetailOperation} from "../cmy-detail-operation/cmy-detail-operation";
import {ModalChoixEvent} from '../cmy-modal/modal-choix-event';
import {Restangular} from 'ngx-restangular';
import {MenuCircular, SousMenu} from "../../components/menu-circular/menu-circular";
import {ListeDocument} from "../cmy-liste-document/cmy-liste-document";

//import 'rxjs/Rx';
@Component({
  selector: 'liste-operation',
  templateUrl: 'cmy-liste-operation.html',
  providers: [Restangular]
})
export class ListeOperation {
  tableauOperations: Array<TableauOperation>;
  tableauOperationsInitial: Array<TableauOperation>;
  loading: any;
  numero: number;
  visible: boolean = false;
  @ViewChild('menu') menu: MenuCircular;

  constructor(public nav: NavController, public constante: Constante,
              public loadingCtrl: LoadingController, private restangular: Restangular, private modalController: ModalController) {
    this.loading = this.loadingCtrl.create();
  }

  ionViewDidLoad() {
    this.loading.present();
    this.restangular.all('user/' + this.constante.user.id + '/operations').getList().subscribe(operations => {
      this.tableauOperations = operations;
      this.tableauOperationsInitial = operations;
      this.loading.dismiss();
    }, errorResponse => {
      this.loading.dismiss();
      this.constante.traiteErreur(errorResponse, this);
    });

    let sousmenus: Array<SousMenu> = new Array();
    sousmenus.push(new SousMenu("Affecter", this.transfert, "share-alt"));
    sousmenus.push(new SousMenu("Detail", this.detail, "open"));
    sousmenus.push(new SousMenu("Document", this.ajoutDocument, "clipboard"));
    sousmenus.push(new SousMenu("Quitter", this.closeMenu, "close"));
    this.menu.config(sousmenus);
  };

  detail(operation: OperationAvecDepense) {
    this.closeMenu();
    this.nav.push(DetailOperation, {theOperation: operation});
  };

  ajoutDocument(operation: OperationAvecDepense) {
    this.closeMenu();
    this.nav.push(ListeDocument, {theOperation: operation});
  };


  transfert(operationAvecDepense: OperationAvecDepense) {
    this.closeMenu();

    if (operationAvecDepense.depense != null) {
      this.constante.presentToast("Opération déjà utilisée!");
      console.log("return transfert");
      return;
    }
    if (operationAvecDepense.operation.montant > 0) {
      this.constante.presentToast("Merci de sélectionner un débit uniquement!");
      return;
    }
    let operation = operationAvecDepense.operation;
    let modal = this.modalController.create(ModalChoixEvent);
    modal.onDidDismiss(event => {
      if (event == null) {
        return;
      }
      this.loading = this.loadingCtrl.create({
        content: 'Enregistrement...',
      });
      this.loading.present();

      let depense = new Depense(this.constante.user.id, event.id);
      depense.idOperation = operation.id;
      depense.montant = -operation.montant;
      depense.commentaire = operation.description;
      depense.date = operation.date;
      this.restangular.one("depense").post("save", depense).subscribe(resp => {
        // Ajout à la liste
        this.loading.dismissAll();
        console.log("dépense sauvée");
        depense.id = resp.id;
        operationAvecDepense.depense = depense;

      }, errorResponse => {
        this.constante.traiteErreur(errorResponse, this);
      });

    });
    modal.present();

  };

  closeMenu() {
    this.visible = false;
    this.menu.toggle();
    this.menu.close();
  };

  blockEvent() {
    console.log("Il faut bloquer!!!");
//    this.parent.cover.nativeElement.style.display="none";
    this.visible = false;
  };

  showMenu(operationAvecDepense: OperationAvecDepense) {
    this.visible = true;
    this.menu.show(this, operationAvecDepense, "divers/operation.png");
    this.menu.toggle();
  };

  filtreOperation(ev) {
    console.log('Filtre');
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.tableauOperations = this.tableauOperationsInitial.filter((item) => {
        return (JSON.stringify(item).toLocaleLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    } else {
      this.tableauOperations = this.tableauOperationsInitial;
    }
  };

};

