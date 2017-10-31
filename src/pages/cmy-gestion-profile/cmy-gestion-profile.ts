import { Component } from '@angular/core';
import {NavController, ModalController, LoadingController, ToastController, AlertController} from 'ionic-angular';
import {FormGroup, FormControl, Validators} from '@angular/forms';


import { WalkthroughPage } from '../walkthrough/walkthrough';

import 'rxjs/Rx';
import {User} from "../cmy-model/cmy.model";
import { Constante } from '../cmy-model/cmy.model';
import {Restangular} from 'ngx-restangular';
import {createElementCssSelector} from "@angular/compiler";
import {Camera, CameraOptions} from "@ionic-native/camera";
import {ModalPhoto} from "../cmy-modal/modal-photo";

@Component({
  selector: 'gestion-profile',
  templateUrl: 'cmy-gestion-profile.html',
  providers:[Restangular]
})
export class GestionProfile {
  settingsForm: FormGroup;
  // make WalkthroughPage the root (or first) page
  rootPage: any = WalkthroughPage;
  loading: any;
  user: User;
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
  constructor(
    public nav: NavController,
    public modal: ModalController,
    private camera: Camera,
    public loadingCtrl: LoadingController,  public toastCtrl: ToastController,public alertController:AlertController,public constante:Constante,private restangular: Restangular
  ) {
    this.loading = this.loadingCtrl.create();
    this.user = this.constante.user;
    this.settingsForm = new FormGroup({
      nom: new FormControl(this.user.nom+" "+this.user.prenom, Validators.required),
      password: new FormControl(this.user.password, Validators.required),
      email: new FormControl(this.user.email, Validators.required),
      phone: new FormControl(this.user.phone, Validators.required),
      iban: new FormControl(this.user.iban, Validators.required),
      currency: new FormControl("euro"),
      notifications: new FormControl(true)
    });
  }

  ionViewDidLoad() {


  }
  private createFileName() {
    let d = new Date();
    let n = d.getTime();
    let newFileName =  "user/"+this.constante.user.id+"_"+ n + ".png";
    return newFileName;
  }

  changePhoto() {
    const alert = this.alertController.create({
      title: 'Modifier votre photo',
      message: "Voulez-vous :",
      buttons: [
        {
          text: 'Prendre une photo',
          role: 'cancel',
          handler: () => {
            this.takePhoto().then((imageData) => {
              this.imageDataCamera = "data:image/png;base64," + imageData;
              let nomFichier = this.createFileName();
              this.user.urlAvatar=nomFichier+"=="+this.imageDataCamera;
              // Envoi de la photo

            }, (err) => {
              this.constante.traiteErreur(err, this);
            });

          }
        },
        {
          text: 'Choisir dans votre galerie',
          handler: () => {
            this.chooseGallery().then((imageData) => {
              this.imageDataCamera = "data:image/png;base64," + imageData;
              let nomFichier = this.createFileName();
              this.user.urlAvatar=nomFichier+"=="+this.imageDataCamera;

            }, (err) => {
              this.constante.traiteErreur(err, this);
            });
          }
        },
        {
          text: 'Ne rien faire',
          handler: () => {

          }
        }
      ]
    });

    alert.present();
  };



  takePhoto() {
    this.options.sourceType = this.camera.PictureSourceType.CAMERA;
    return this.camera.getPicture(this.options);
  };

  chooseGallery() {
    this.options.sourceType=this.camera.PictureSourceType.PHOTOLIBRARY;
    return this.camera.getPicture(this.options);
  };

  logout() {
    // navigate to the new page if it is not the current page
    this.constante.user=new User();
    this.nav.setRoot(this.rootPage);
  };

  save() {
    this.loading.present();
    let user = this.restangular.copy(this.user);
    user.route = "user";
    let str = this.settingsForm.get("nom").value;
    if(str.indexOf(" ")>0) {
      user.nom = str.split(" ")[0];
      user.prenom = str.split(" ")[1];
    } else {
      user.nom = str;
      user.prenom="";
    }
    user.password=this.settingsForm.get("password").value;
    user.email=this.settingsForm.get("email").value;
    user.phone=this.settingsForm.get("phone").value;
    user.iban=this.settingsForm.get("iban").value;

    user.save().toPromise().then(resp => {
      this.constante.user=resp;
      this.loading.dismissAll();
    },err=> {
      this.constante.traiteErreur(err,this);
    });
  };

}
