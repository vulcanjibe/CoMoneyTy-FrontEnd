import { Component } from '@angular/core';

import { ModalController, Platform, NavParams, ViewController } from 'ionic-angular';

import {Event,  Constante} from '../cmy-model/cmy.model';
import {DetailEventPage} from '../cmy-detail-event/cmy-detail-event';
import {CreationEventPage} from '../cmy-creation-event/cmy-creation-event';
import {Restangular} from 'ngx-restangular';
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
      this.photos[i]='photoEvent'+(i+1)+'.png';
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
