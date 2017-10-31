import { Component } from '@angular/core';
import { NavController, LoadingController,AlertController,ModalController,NavParams,ToastController } from 'ionic-angular';
import {Validators, FormGroup, FormControl} from '@angular/forms';
import 'rxjs/Rx';
import { Platform } from 'ionic-angular';
import { Event,User,UserAvecDepense,Constante,Depense } from '../cmy-model/cmy.model';
import { Camera, CameraOptions } from '@ionic-native/camera';
import {ModalPhoto} from '../cmy-modal/modal-photo'
import {Restangular} from 'ngx-restangular';
declare var cordova: any;
@Component({
  selector: 'creation-depense-page',
  templateUrl: 'cmy-creation-depense.html',
  providers:[Restangular]
})
export class CreationDepensePage {
  event: Event;
  participants: Array<UserAvecDepense>;
  depense:Depense;
  encours:boolean = false;
  creationMouvementForm: FormGroup;
  loading: any;
  imageUrl: string = null;
  imageDataCamera: string = null;
  valid:boolean =false;
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
              private camera: Camera,
              public params: NavParams,
             public toastCtrl: ToastController) {

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
  };
  popupPartage() {
    this.presentToast("Pas encore implementé");
  };



  saveMouvement(){
    this.encours=true;
    this.depense.commentaire = this.creationMouvementForm.get('commentaire').value;
    this.depense.date = this.creationMouvementForm.get('date').value;
    this.depense.montant = parseFloat(this.creationMouvementForm.get('montant').value);
    this.depense.typeRepartition="equitable";

    if(this.imageDataCamera==null) {


    } else {
      // Nouvelle photo en envoyer
      this.imageUrl = this.createFileName();
      this.imageUrl+="=="+this.imageDataCamera;
    };

    this.depense.urlPhoto = this.imageUrl;
    this.loading = this.loadingCtrl.create({
      content: 'Enregistrement...',
    });
    this.loading.present();

    this.restangular.one("depense").post("save",this.depense).subscribe(resp => {

      let montant =  this.depense.montant/this.participants.length;
      for(let participant of this.participants)
        if(participant.user.id!=this.depense.idPayeur)
          participant.doit+=montant;
        else {
          participant.aPaye += this.depense.montant;
          participant.doit -= this.depense.montant - montant;
        }
      this.event.montantTotal+=this.depense.montant;
      this.loading.dismissAll();
      this.nav.pop();


    }, errorResponse => {
      this.encours=false;
      this.constante.traiteErreur(errorResponse,this);

    });



  };


  choosePhoto(){

    let modal = this.modalCtrl.create(ModalPhoto);
    modal.onDidDismiss(data => {
      console.log(data);
      this.imageUrl=data;
    });
    modal.present();
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
    let newFileName =  "mouvement/"+this.constante.user.id+"_"+ n + ".png";
    return newFileName;
  };



  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  };


};
