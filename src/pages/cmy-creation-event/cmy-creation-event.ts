import { Component } from '@angular/core';
import { NavController, LoadingController,AlertController,ModalController,NavParams } from 'ionic-angular';
import {Validators, FormGroup, FormControl, EmailValidator} from '@angular/forms';
import 'rxjs/Rx';
import { Platform } from 'ionic-angular';
import { Event,User,Constante } from '../cmy-model/cmy.model';
import { Camera, CameraOptions } from '@ionic-native/camera';
import {ModalPhoto} from '../cmy-modal/modal-photo'
import {Restangular} from 'ngx-restangular';
import {List2EventPage} from "../cmy-liste-event/cmy-liste-event";
@Component({
  selector: 'creation-event-page',
  templateUrl: 'cmy-creation-event.html',
  providers:[Restangular]
})
export class CreationEventPage {
  event: Event;
  events: Array<Event>;
  creationEventForm: FormGroup;
  loading: any;
  categories_checkbox_open: boolean;
  categories_checkbox_result;
  public base64Image: string;
  options: CameraOptions = {
    quality: 100,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE
  }

  constructor(public nav: NavController,
    public loadingCtrl: LoadingController,public modalCtrl: ModalController,public constante:Constante,private restangular: Restangular,
              public alertCtrl: AlertController,private camera: Camera, private platform: Platform,public params: NavParams) {
    this.loading = this.loadingCtrl.create();
    this.creationEventForm = new FormGroup({
      titre: new FormControl('', Validators.compose([
        Validators.required])),
      date: new FormControl('', Validators.compose([
        Validators.required])),
    });
    this.event = new Event();
    this.events = params.get("listeEvent");
  };




  saveEvent(){
    this.event.libelle = this.creationEventForm.get('titre').value;
    this.event.date = this.creationEventForm.get('date').value;
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
      this.camera.getPicture(this.options).then((imageData) => {
        // imageData is either a base64 encoded string or a file URI
        // If it's base64:
        this.base64Image = 'data:image/jpeg;base64,' + imageData;
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

}
