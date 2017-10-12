import { Component } from '@angular/core';
import { NavController, LoadingController,AlertController,ModalController,NavParams,ToastController } from 'ionic-angular';
import {Validators, FormGroup, FormControl} from '@angular/forms';
import 'rxjs/Rx';
import { Platform } from 'ionic-angular';
import { Event,Constante } from '../cmy-model/cmy.model';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { FilePath } from '@ionic-native/file-path';
import { File } from '@ionic-native/file';
import { Transfer, TransferObject } from '@ionic-native/transfer';
import {ModalPhoto} from '../cmy-modal/modal-photo'
import {Restangular} from 'ngx-restangular';
declare var cordova: any;
@Component({
  selector: 'creation-event-page',
  templateUrl: 'cmy-creation-event.html',
  providers:[Restangular]
})
export class CreationEventPage {
  event: Event;
  encours:boolean = false;
  events: Array<Event>;
  creationEventForm: FormGroup;
  lastImage: string = null;
  loading: any;
  categories_checkbox_open: boolean;
  categories_checkbox_result;
  valid:boolean = false;
  imageCamera: string = null;

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

    this.creationEventForm = new FormGroup({
      titre: new FormControl('', Validators.compose([
        Validators.required])),
      date: new FormControl(new Date().toISOString(), Validators.compose([
        Validators.required])),
    });
    this.event = new Event();
    this.events = params.get("listeEvent");
  };




  saveEvent(){
    this.event.libelle = this.creationEventForm.get('titre').value;
    this.event.date = this.creationEventForm.get('date').value;
    let sourceType = this.options.sourceType;

    let imagePath = this.imageCamera;

    if (this.platform.is('mobileweb') || this.platform.is('core')) {
      // This will only print when running on desktop
      // Pas de photo
      this.lastImage = "standard.png";
    } else {
      if(this.imageCamera==null) {
        // Pas de photo prise
        this.lastImage = "standard.png";
      } else
        this.lastImage = this.createFileName();
    }

    this.event.urlPhoto = "event/"+this.lastImage;
  /*  this.loading = this.loadingCtrl.create({
      content: 'Enregistrement...',
    });
    this.loading.present(); */
    this.encours = true;
    this.restangular.one("event").post("save",this.event).subscribe(resp => {
      // Ajout à la liste
    //  this.loading.dismissAll();
      this.events.push(resp);
      if (this.platform.is('mobileweb') || this.platform.is('core')) {
        this.encours = false;
        this.nav.pop();
      } else if(this.lastImage=="standard.png") {
        //Pas de photo à envoyer
        this.encours = false;
        this.nav.pop();
      }
      // let component_page : any = { component: List2EventPage };
      //this.nav.setRoot( component_page.component);
    }, errorResponse => {
      this.constante.traiteErreur(errorResponse,this);
    });

    if (this.platform.is('mobileweb') || this.platform.is('core')) {
      // This will only print when running on desktop
      // Pas de photo
    } else if(this.lastImage=="standard.png") {
      //Pas de photo
    } else {
      if(imagePath==null)
      {
        this.nav.pop();
        return;
      }
      this.loading = this.loadingCtrl.create({
        content: 'Enregistrement...',
      });
      this.loading.present();
      if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
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


  chooseCategory(){
    let alert = this.alertCtrl.create({
      cssClass: 'category-prompt'
    });
    alert.setTitle('Categorie');

    alert.addInput({
      type: 'checkbox',
      label: 'Sortie',
      value: 'sortie',
      checked: true
    });

    alert.addInput({
      type: 'checkbox',
      label: 'Soirée',
      value: 'soirée'
    });
    alert.addInput({
      type: 'checkbox',
      label: 'Coloc',
      value: 'coloc'
    });

    alert.addButton('Annule');
    alert.addButton({
      text: 'OK',
      handler: data => {
        console.log('Checkbox data:', data);
        this.categories_checkbox_open = false;
        this.categories_checkbox_result = data;
      }
    });
    alert.present().then(() => {
      this.categories_checkbox_open = true;
    });
  }
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
        this.constante.traiteErreur(err,this);
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
      this.constante.traiteErreur(error,this);
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
    var url = this.constante.BASE_URL_REST+"/event/upload";

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
      this.loading.dismissAll();
      this.nav.pop();
      this.presentToast('Image succesful uploaded.');
      //this.event.type = this.creationEventForm.get('type').value;
      this.encours = false;
    }, err => {
      this.encours = false;
      this.constante.traiteErreur(err,this);
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
