import {Component} from '@angular/core';

import {NavParams, Platform, ViewController} from 'ionic-angular';

import {Constante} from '../cmy-model/cmy.model';

@Component({
  templateUrl: 'modal-one-photo.html'
})
export class ModalOnePhoto {
  loading: any;
  photo:string;
  constructor(
    public platform: Platform,
    public params: NavParams,
    public viewCtrl: ViewController,
    public constante:Constante
  ) {
    this.photo=this.params.get("thePhoto");
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
