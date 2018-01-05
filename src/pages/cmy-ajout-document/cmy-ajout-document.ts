import {Component} from '@angular/core';
//import 'rxjs/Rx';
import {LoadingController, ModalController, NavController, NavParams, ToastController} from 'ionic-angular';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Constante, Document, OperationAvecDepense} from '../cmy-model/cmy.model';
import {Camera, CameraOptions} from '@ionic-native/camera';
import {ModalPhoto} from '../cmy-modal/modal-photo'
import {Restangular} from 'ngx-restangular';
import {FileTransfer, FileTransferObject, FileUploadOptions} from "@ionic-native/file-transfer";
import {FileChooser} from "@ionic-native/file-chooser";
import {FilePath} from "@ionic-native/file-path";


@Component({
  selector: 'ajout-document-page',
  templateUrl: 'cmy-ajout-document.html',
  providers:[Restangular]
})
export class AjoutDocumentPage {
  creationDocumentForm: FormGroup;
  loading: any;
  imageUrl: string = null;
  imageDataCamera: string = null;
  documentName:string=null;
  documentFolder:string=null;
  valid:boolean =false;
  operation:OperationAvecDepense;
  documents:Array<Document>;
  options: CameraOptions = {
    quality: 80,
    sourceType:  this.camera.PictureSourceType.CAMERA,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.PNG,
    saveToPhotoAlbum: false,
    targetWidth: 200,
    targetHeight: 200
  };



  constructor(private fileChooser: FileChooser,private transfer: FileTransfer,public nav: NavController,private filePath:FilePath,
    public loadingCtrl: LoadingController,
              public modalCtrl: ModalController,
              public constante:Constante,
              private restangular: Restangular,
              private camera: Camera,
              public params: NavParams,
             public toastCtrl: ToastController) {

    this.operation = params.get("theOperation");
    this.documents = params.get("theDocuments");
    this.creationDocumentForm = new FormGroup({
      commentaire: new FormControl('', Validators.compose([
        Validators.required]))
    });
  };

  savePhoto() {
    let promise = new Promise<Document>((resolve, reject) => {
        // Nouvelle photo en envoyer
        this.imageUrl = this.createFileName();
        this.imageUrl += "==" + this.imageDataCamera;

        let document = new Document();
        document.type="Photo";
        document.url = this.imageUrl;
        document.description = this.creationDocumentForm.get("commentaire").value;
        document.date = new Date();
        document.idOperation = this.operation.operation.id;
        this.restangular.one("document").post("save", document).subscribe(resp => {
          this.documents.push(resp);
          resolve(resp);
        }, errorResponse => {
          reject(errorResponse);
        });
    });
    return promise;
  }
  saveOneDocument(folder:string,name:string) {
    let d = new Date();
    let n = d.getTime();
    let newFileName =  "document/"+this.constante.user.id+"_"+ n + "_"+name;
    let options: FileUploadOptions = {
      fileKey: 'file',
      fileName: newFileName,
      headers: {}
    };
    let promise = new Promise<Document>((resolve, reject) => {
      // Nouvelle photo en envoyer
      let fileTransfer: FileTransferObject = this.transfer.create();
      let urlApi = this.constante.BASE_URL_REST+"/utilitaire/upload";
      let uri = folder+"/"+name;
      fileTransfer.upload(uri, urlApi, options).then(rep => {
        let document = new Document();
        document.description = this.creationDocumentForm.get("commentaire").value;
        document.type="Doc";
        document.date = new Date();
        document.url = newFileName;
        document.idOperation = this.operation.operation.id;
        this.restangular.one("document").post("save", document).subscribe(resp => {
          this.documents.push(resp);
          resolve(resp);
        }, errorResponse => {
          reject(errorResponse);
        });
      },errorResponse=>{
        reject(errorResponse);
      });
    });
    return promise;
  }



  saveDocument(){
    let tab = new Array();
    if(this.imageDataCamera!=null) {
      tab.push(this.savePhoto());
    };
    if(this.documentName!=null) {
      tab.push(this.saveOneDocument(this.documentFolder,this.documentName));
    }

    this.loading = this.loadingCtrl.create({
      content: 'Enregistrement...',
    });
    this.loading.present();

    Promise.all(tab).then(rep=> {
      this.loading.dismissAll();
      this.nav.pop();
    }, errorResponse => {
      this.constante.traiteErreur(errorResponse,this);
    });
  };


  chooseDocument(){
    this.fileChooser.open().then(rep=>{
      let index = rep.lastIndexOf("/");
      this.documentName = rep.substring(index+1);
      this.documentFolder = rep.substring(0 ,index);
    } ,error=>{
      this.constante.traiteErreur(error, this);
    });
  };

  takePhoto() {
    this.options.sourceType = this.camera.PictureSourceType.CAMERA;
    this.camera.getPicture(this.options).then((imageData) => {
      this.imageDataCamera = "data:image/png;base64," + imageData;
    }, (err) => {
      this.constante.traiteErreur(err, this);
    });
  };

  chooseGallery() {
    this.options.sourceType=this.camera.PictureSourceType.PHOTOLIBRARY;
    this.camera.getPicture(this.options).then((imageData) => {
      this.imageDataCamera = "data:image/png;base64,"+imageData;
    }, (err) => {
      this.constante.traiteErreur(err,this);
    });
  };

  // Create a new name for the image
  private createFileName() {
    let d = new Date();
    let n = d.getTime();
    let newFileName =  "document/"+this.constante.user.id+"_"+ n + ".png";
    return newFileName;
  };
};
