import { Component } from '@angular/core';
import { NavController, LoadingController,AlertController,ModalController,NavParams,ToastController } from 'ionic-angular';
import {Validators, FormGroup, FormControl} from '@angular/forms';
import 'rxjs/Rx';
import { Platform } from 'ionic-angular';
import { Event,Constante } from '../cmy-model/cmy.model';
import { Camera, CameraOptions } from '@ionic-native/camera';
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
  imageUrl: string = null;
  loading: any;
  categories_checkbox_open: boolean;
  categories_checkbox_result;
  imageDataCamera: string = null;

  options: CameraOptions = {
    quality: 80,
    sourceType:  this.camera.PictureSourceType.CAMERA,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.PNG,
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
              public params: NavParams,
             public toastCtrl: ToastController,
) {

    this.creationEventForm = new FormGroup({
      titre: new FormControl('', Validators.compose([
        Validators.required])),
      date: new FormControl(new Date().toISOString(), Validators.compose([
        Validators.required])),
    });
    this.event = new Event();
    this.events = params.get("listeEvent");
  };


  // Create a new name for the image
  private createFileName() {
    let d = new Date();
    let n = d.getTime();
    let newFileName =  "event/"+this.constante.user.id+"_"+ n + ".png";
    return newFileName;
  }

  saveEvent(){
    this.event.libelle = this.creationEventForm.get('titre').value;
    this.event.date = this.creationEventForm.get('date').value;

    if(this.imageDataCamera==null) {
      // Pas de nouvelle photo
      if(this.imageUrl==null) {
        this.imageUrl='event/standard.png';
      }
    } else {
      // Nouvelle photo en envoyer
      this.imageUrl = this.createFileName();
      this.imageUrl+="=="+this.imageDataCamera;
    }

    this.event.urlPhoto = this.imageUrl;
   this.loading = this.loadingCtrl.create({
      content: 'Enregistrement...',
    });
    this.loading.present();
    let eventRest = this.restangular.copy(this.event);
    eventRest.route="event";
    eventRest.save().toPromise().then(resp => {
      this.loading.dismissAll();
      this.events.push(resp);
      this.loading.dismissAll();
      this.nav.pop();
    }, errorResponse => {
      this.constante.traiteErreur(errorResponse,this);
    });


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

    let modal = this.modalCtrl.create(ModalPhoto);
    modal.onDidDismiss(data => {
      console.log(data);
      this.imageUrl=data;
    });
    modal.present();
  }

  takePhoto() {
    this.options.sourceType = this.camera.PictureSourceType.CAMERA;
    this.camera.getPicture(this.options).then((imageData) => {
      this.imageDataCamera = "data:image/png;base64," + imageData;
    }, (err) => {
      this.constante.traiteErreur(err, this);
    });
  }

    chooseGallery() {
      this.options.sourceType=this.camera.PictureSourceType.PHOTOLIBRARY;
      this.camera.getPicture(this.options).then((imageData) => {
        this.imageDataCamera = "data:image/png;base64,"+imageData;
      }, (err) => {
        this.constante.traiteErreur(err,this);
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


}
