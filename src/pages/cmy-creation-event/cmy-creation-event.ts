import { Component } from '@angular/core';
import { NavController, LoadingController,AlertController,ModalController,NavParams,ToastController } from 'ionic-angular';
import {Validators, FormGroup, FormControl, EmailValidator} from '@angular/forms';
import 'rxjs/Rx';
import { Platform } from 'ionic-angular';
import { Event,User,Constante } from '../cmy-model/cmy.model';
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
  events: Array<Event>;
  creationEventForm: FormGroup;
  lastImage: string = null;
  loading: any;
  categories_checkbox_open: boolean;
  categories_checkbox_result;
  monimageURL:string;
  public base64Image: string;
  options: CameraOptions = {
    quality: 100,
    sourceType:  this.camera.PictureSourceType.CAMERA,
    saveToPhotoAlbum: false,
    correctOrientation: true,
    targetWidth: 200,
    targetHeight: 200
  }

  /*
  options: CameraOptions = {
    destinationType: this.camera.DestinationType.DATA_URL,
    targetWidth: 200,
    targetHeight: 200
  }
*/
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
    this.loading = this.loadingCtrl.create();
    this.creationEventForm = new FormGroup({
      titre: new FormControl('', Validators.compose([
        Validators.required])),
      date: new FormControl('', Validators.compose([
        Validators.required])),
    });
    this.event = new Event();
    this.events = params.get("listeEvent");
    this.monimageURL=cordova.file.dataDirectory+'photo/image.jpg';
  };




  saveEvent(){
    this.event.libelle = this.creationEventForm.get('titre').value;
    this.event.date = this.creationEventForm.get('date').value;
    this.event.urlPhoto = 'photoEvent1.png';
    //this.event.type = this.creationEventForm.get('type').value;
    this.restangular.one("event").post("save",this.event).subscribe(resp => {
      // Ajout à la liste
      this.events.push(resp);
      this.nav.pop();
     // let component_page : any = { component: List2EventPage };
      //this.nav.setRoot( component_page.component);
    }, errorResponse => {
      console.log("Error with status code", errorResponse.status);
    });
  };


  chooseCategory(){
    let alert = this.alertCtrl.create({
      cssClass: 'category-prompt'
    });
    alert.setTitle('Category');

    alert.addInput({
      type: 'checkbox',
      label: 'Alderaan',
      value: 'value1',
      checked: true
    });

    alert.addInput({
      type: 'checkbox',
      label: 'Bespin',
      value: 'value2'
    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'Confirm',
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
    if (this.platform.is('mobileweb') || this.platform.is('core')) {
      // This will only print when running on desktop
      console.log("I'm a regular browser!");
      this.openModalChoosePhoto();
      this.event.urlPhoto="photoEvent1.png";
    } else {
      let sourceType = this.options.sourceType;
      this.camera.getPicture(this.options).then((imagePath) => {
        if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
          this.filePath.resolveNativePath(imagePath)
            .then(filePath => {
              let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
              let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
              this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
            });
        } else {
          var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
          var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
          this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
        }



      }, (err) => {
        // Handle error
      });
    }
  }


  openModalChoosePhoto() {

    let modal = this.modalCtrl.create(ModalPhoto);
    modal.onDidDismiss(data => {
      console.log(data);
      this.base64Image = this.constante.REP_IMAGE+"events/"+data;
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
  private copyFileToLocalDir(namePath, currentName, newFileName) {
    this.file.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(success => {
      this.lastImage = newFileName;
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

    this.loading = this.loadingCtrl.create({
      content: 'Uploading...',
    });
    this.loading.present();

    // Use the FileTransfer to upload the image
    fileTransfer.upload(targetPath, url, options).then(data => {
      this.loading.dismissAll()
      this.presentToast('Image succesful uploaded.');
    }, err => {
      this.loading.dismissAll()
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
