import {Component} from '@angular/core';
import {AlertController, LoadingController, ModalController, NavController, ToastController} from 'ionic-angular';
import {FormControl, FormGroup, Validators} from '@angular/forms';


import {WalkthroughPage} from '../walkthrough/walkthrough';
//import 'rxjs/Rx';
import {Constante, User} from "../cmy-model/cmy.model";
import {Restangular} from 'ngx-restangular';
import {Camera, CameraOptions} from "@ionic-native/camera";
import CryptoJS from 'crypto-js';

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
  private CryptoJS: any;
  options: CameraOptions = {
    quality: 80,
    sourceType:  this.camera.PictureSourceType.CAMERA,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.PNG,
    saveToPhotoAlbum: false,
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
      email: new FormControl(this.user.email, Validators.compose([Validators.required,Validators.minLength(5),Validators.pattern("[a-z0-9.-_]+@[a-z.]+")])),
      phone: new FormControl(this.user.phone, Validators.compose([Validators.required,Validators.minLength(10),Validators.pattern("^(?:(?:\\+|00)33|0)\\s*[1-9](?:[\\s.-]*\\d{2}){4}$")])),
      nom: new FormControl(this.user.nom, Validators.compose([Validators.required,Validators.minLength(5)])),
      prenom: new FormControl(this.user.prenom, Validators.compose([Validators.required,Validators.minLength(3)])),
      password: new FormControl('', Validators.compose([Validators.required,Validators.minLength(5)])),
      confirm_password: new FormControl('', Validators.compose([Validators.required,Validators.minLength(5)])),
      iban: new FormControl(this.user.iban, Validators.required),
      currency: new FormControl("euro"),
      notifications: new FormControl(true),
      toogleCodeSecu: new FormControl(true),
      codecourt : new FormControl(this.user.codecourt, Validators.compose([Validators.required,Validators.minLength(4),Validators.required,Validators.maxLength(4),Validators.pattern("^[0-9]{4}$")])),
    });

    if(this.user.codecourt==null || this.user.codecourt.length==0) {
      this.settingsForm.get("toogleCodeSecu").setValue(false);
    }
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
    user.password=this.settingsForm.get("password").value;
    let passconf = this.settingsForm.get("confirm_password").value;
    if(passconf!=user.password)
    {
      this.constante.presentToast("Les mots de passe sont différents!");
      this.settingsForm.get("confirm_password").markAsDirty();
      return;
    }
    user.email=this.settingsForm.get("email").value;
    user.phone=this.settingsForm.get("phone").value;
    user.iban=this.settingsForm.get("iban").value;
    user.nom = this.settingsForm.get("nom").value;
    user.prenom = this.settingsForm.get("prenom").value;
    user.codecourt = this.settingsForm.get("codecourt").value;
    if(!this.settingsForm.get("toogleCodeSecu").value) {
      user.codecourt="";
    }
    user.save().toPromise().then(resp => {
      this.constante.user=resp;
      if(resp.codecourt==null || resp.codecourt.length==0) {
        localStorage.removeItem("codecourt");
      } else {
        let derivedKey = CryptoJS.PBKDF2(resp.codecourt, "AlwaysTheSameSalt", {
          keySize: 512 / 32,
          iterations: 5
        }).toString();
        localStorage.setItem("codecourt", derivedKey);
      }
      this.loading.dismissAll();
    },err=> {
      this.constante.traiteErreur(err,this);
    });
  };

}
