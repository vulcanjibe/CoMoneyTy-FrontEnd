import {Component} from '@angular/core';
import {LoadingController, ModalController, NavController, NavParams} from 'ionic-angular';
import {Constante, Document, OperationAvecDepense} from '../cmy-model/cmy.model';
import {Restangular} from 'ngx-restangular';
import {AjoutDocumentPage} from "../cmy-ajout-document/cmy-ajout-document";
import {ModalOnePhoto} from "../cmy-modal/modal-one-photo";
import {FileOpener} from "@ionic-native/file-opener";

//import 'rxjs/Rx';
@Component({
  selector: 'liste-document',
  templateUrl: 'cmy-liste-document.html',
  providers:[Restangular]
})
export class ListeDocument {

  operationAvecDepense:OperationAvecDepense;
  documents:Array<Document>;
  loading: any;

  constructor(public nav: NavController,public constante:Constante,private fileOpener: FileOpener,
    public loadingCtrl: LoadingController,public navParams: NavParams,private restangular: Restangular, public modalCtrl: ModalController) {
    this.loading = this.loadingCtrl.create();
    this.operationAvecDepense = this.navParams.get("theOperation");
  };


  ionViewDidLoad() {
    this.loading.present();
    // This will query /accounts and return a observable.
    this.restangular.all('operation/'+this.operationAvecDepense.operation.id+'/document').getList().subscribe(histo => {
      console.log(histo);
      this.documents = histo;
      this.loading.dismissAll();
    },errorResponse => {
      this.constante.traiteErreur(errorResponse,this);
    });


  };

  addNewDocument() {
    this.nav.push(AjoutDocumentPage,{theOperation:this.operationAvecDepense,theDocuments:this.documents});
  };

  show(document:Document) {
    if(document.type == 'Photo') {
      let modal = this.modalCtrl.create(ModalOnePhoto,{thePhoto: document.url});
      modal.onDidDismiss(data => {
      });
      modal.present();
    };
    if(document.type == 'Doc') {
      if(document.url.endsWith("pdf")) {
        this.fileOpener.open(document.url, 'application/pdf').then(rep =>{

        },error => {

        });
      } else if(document.url.indexOf("_image%")>=0) {
        let modal = this.modalCtrl.create(ModalOnePhoto,{thePhoto: document.url});
        modal.onDidDismiss(data => {
        });
        modal.present();

      }

    };
  };
}
