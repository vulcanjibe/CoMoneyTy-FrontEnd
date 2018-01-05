import {Component} from '@angular/core';
import {LoadingController, NavParams} from 'ionic-angular';
import {Constante, Event, User} from '../cmy-model/cmy.model';
import {Restangular} from 'ngx-restangular';

//import 'rxjs/Rx';
@Component({
  selector: 'detail-ami',
  templateUrl: 'cmy-detail-ami.html',
  providers:[Restangular]
})
export class DetailAmi {
  ami: User;
  events: Array<Event>;
  loading: any;

  constructor(
              private loadingCtrl: LoadingController,private constante:Constante,private restangular: Restangular,private navParams: NavParams) {
    this.loading = this.loadingCtrl.create();
    this.ami = navParams.get("theAmi");
  }

  ionViewDidLoad() {
    this.loading.present();

    // Lecture des participants de cet event
    this.restangular.one('user/'+this.constante.user.id+'/detailAmi/'+this.ami.id).get().toPromise().then(rep => {
      console.log(rep);
      this.events=rep.Event;
      this.loading.dismiss();
    }, errorResponse => {
      this.constante.traiteErreur(errorResponse,this);
    });

  };

}
