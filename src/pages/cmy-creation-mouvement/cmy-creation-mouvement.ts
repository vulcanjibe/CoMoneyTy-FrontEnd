import { Component } from '@angular/core';
import { NavController, LoadingController,AlertController,ModalController,NavParams,ToastController } from 'ionic-angular';
import {Validators, FormGroup, FormControl} from '@angular/forms';
import 'rxjs/Rx';
import { Platform } from 'ionic-angular';
import { Event,User,UserAvecDepense,Constante,Depense } from '../cmy-model/cmy.model';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { FilePath } from '@ionic-native/file-path';
import { File } from '@ionic-native/file';
import { Transfer, TransferObject } from '@ionic-native/transfer';
import {ModalPhoto} from '../cmy-modal/modal-photo'
import {Restangular} from 'ngx-restangular';
declare var cordova: any;
@Component({
  selector: 'creation-mouvement-page',
  templateUrl: 'cmy-creation-mouvement.html',
  providers:[Restangular]
})
export class CreationMouvementPage {
  event: Event;
  participants: Array<UserAvecDepense>;
  depense:Depense;
  creationMouvementForm: FormGroup;
  lastImage: string = null;
//  loading: any;
  imageCamera: string = null;
  valid:boolean =false;
  options: CameraOptions = {
    quality: 100,
    sourceType:  this.camera.PictureSourceType.CAMERA,
    saveToPhotoAlbum: false,
    correctOrientation: true,
    targetWidth: 200,
    targetHeight: 200
  };


  constructor(public nav: NavController,
    public loadingCtrl: LoadingController,
              public modalCtrl: ModalController,
              public constante:Constante,
              private restangular: Restangular,
              public alertCtrl: AlertController,
              private camera: Camera,
              private platform: Platform,
              public params: NavParams,
              private transfer: Transfer,
             public toastCtrl: ToastController,
              private file: File,
              private filePath: FilePath) {

    this.creationMouvementForm = new FormGroup({
      commentaire: new FormControl('', Validators.compose([
        Validators.required])),
      montant: new FormControl('', Validators.compose([
        Validators.required])),
      date: new FormControl(new Date().toISOString(), Validators.compose([
        Validators.required]))
    });
    this.event = params.get("theEvent");
    this.participants = params.get("theParticipants");
    let theUser:User=this.constante.user;//JSON.parse(localStorage.getItem('user'));
    this.depense=new Depense(theUser.id,this.event.id);
  };


  popupPayePar() {
    this.presentToast("Pas encore implementé");
  }
  popupPartage() {
    this.presentToast("Pas encore implementé");
  }

  saveMouvement(){
    this.depense.commentaire = this.creationMouvementForm.get('commentaire').value;
    this.depense.date = this.creationMouvementForm.get('date').value;
    this.depense.montant = parseFloat(this.creationMouvementForm.get('montant').value);
    this.depense.typeRepartition="equitable";

    if (this.platform.is('mobileweb') || this.platform.is('core')) {
      // This will only print when running on desktop
      // Pas de photo
      this.lastImage = "standard.png";
    } else {
      this.lastImage = this.createFileName();
    }
    this.depense.urlPhoto = "mouvement/"+this.lastImage;
   /* this.loading = this.loadingCtrl.create({
      content: 'Enregistrement...',
    });
    this.loading.present(); */
    this.restangular.one("depense").post("save",this.depense).subscribe(resp => {
      // Ajout à la liste
      //this.loading.dismissAll();
      // il faut revoir toute la répartition...
      // On eclate le montant à part egal avec tout le montant
      let montant =  this.depense.montant/this.participants.length;
      for(let participant of this.participants)
        if(participant.user.id!=this.depense.idPayeur)
          participant.doit+=montant;
        else participant.aPaye+=this.depense.montant;

      // let component_page : any = { component: List2EventPage };
      //this.nav.setRoot( component_page.component);
      if (this.platform.is('mobileweb') || this.platform.is('core')) {
        this.nav.pop();
      }

    }, errorResponse => {
      console.log("Error with status code", errorResponse.status);

    });

    if (this.platform.is('mobileweb') || this.platform.is('core')) {
      // This will only print when running on desktop
      // Pas de photo
    }
    else {
      let sourceType = this.options.sourceType;

      let imagePath = this.imageCamera;
      if(imagePath==null)
      {
        this.nav.pop();
      }
      else if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        this.filePath.resolveNativePath(imagePath)
          .then(filePath => {
            let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
            let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
            this.sendandsave(correctPath, currentName, this.lastImage);
          });
      } else {
        var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        this.sendandsave(correctPath, currentName, this.lastImage);
      }
    }

  };



  choosePhoto(){
    this.valid=false;
    if (this.platform.is('mobileweb') || this.platform.is('core')) {
      // This will only print when running on desktop
      console.log("I'm a regular browser!");
      this.openModalChoosePhoto();
      this.event.urlPhoto="photoEvent1.png";
    } else {

      this.camera.getPicture(this.options).then((imagePath) => {
        this.valid=true;
        this.imageCamera = imagePath;
      }, (err) => {
        console.log(err);
      });
    }
  }


  openModalChoosePhoto() {

    let modal = this.modalCtrl.create(ModalPhoto);
    modal.onDidDismiss(data => {
      console.log(data);
      //this.base64Image = this.constante.REP_IMAGE+"events/"+data;
    });
    modal.present();
  }


  // Create a new name for the image
  private createFileName() {
    var d = new Date(),
      n = d.getTime(),
      newFileName =  n + ".jpg";
    return newFileName;
  }

/// Copy the image to a local folder
  private sendandsave(namePath, currentName, newFileName) {
    this.file.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(success => {
      this.lastImage = newFileName;

      this.uploadImage();

    }, error => {
      this.presentToast('Error while storing file.');
    });
  }

  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }


  public uploadImage() {
    // Destination URL
    var url = this.constante.BASE_URL_REST+"/mouvement/upload";

    // File for Upload
    var targetPath = this.pathForImage(this.lastImage);

    // File name only
    var filename = this.lastImage;

    var options = {
      fileKey: "file",
      fileName: filename,
      chunkedMode: false,
      mimeType: "multipart/form-data",
      params : {'fileName': filename}
    };

    const fileTransfer: TransferObject = this.transfer.create();

    // Use the FileTransfer to upload the image
    fileTransfer.upload(targetPath, url, options).then(data => {
      this.nav.pop();
      this.presentToast('Image succesful uploaded.');
      //this.event.type = this.creationMouvementForm.get('type').value;

    }, err => {

      this.presentToast('Error while uploading file.');
    });
  }

  // Always get the accurate path to your apps folder
  public pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      return cordova.file.dataDirectory + img;
    }
  }
}
