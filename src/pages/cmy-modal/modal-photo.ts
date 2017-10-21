import { Component } from '@angular/core';

import {  Platform, NavParams, ViewController } from 'ionic-angular';

import {  Constante} from '../cmy-model/cmy.model';

@Component({
  templateUrl: 'modal-photo.html'
})
export class ModalPhoto {
  loading: any;
  photos:Array<String>;
  constructor(
    public platform: Platform,
    public params: NavParams,
    public viewCtrl: ViewController,
    public constante:Constante
  ) {
    this.photos=new Array;
    for(let i=0;i<4;i++)
    {
      this.photos[i]='event/photoEvent'+(i+1)+'.png';
    }
  }
  choose(photo: string) {
    let data = photo;
    this.viewCtrl.dismiss(data);
  }
  dismiss() {
    this.viewCtrl.dismiss();
  }
}
