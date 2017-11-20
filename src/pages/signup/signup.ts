import { Component } from '@angular/core';
import { NavController, ModalController, LoadingController,ToastController } from 'ionic-angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';

import  {ListeEvent} from "../cmy-liste-event/cmy-liste-event";
import {Restangular} from 'ngx-restangular';
import { FacebookLoginService } from '../login/facebook-login.service';
import { GoogleLoginService } from '../login/google-login.service';
import {User,Constante} from "../cmy-model/cmy.model";
import {factoryOrValue} from "rxjs/operator/multicast";
import {FacebookUserModel} from "../cmy-model/facebook-user.model";
import {GoogleUserModel} from "../cmy-model/google-user.model";
import {Home} from "../cmy-home/cmy-home";
import {PrivacyPolicyPage} from "../privacy-policy/privacy-policy";

@Component({
  selector: 'signup-page',
  templateUrl: 'signup.html',
  providers:[Restangular]
})
export class SignupPage {
  signup: FormGroup;
  main_page: { component: any };
  loading: any;

  constructor(
    public nav: NavController,
    private restangular: Restangular,
    public modal: ModalController,
    public toastCtrl: ToastController,
    public facebookLoginService: FacebookLoginService,
    public googleLoginService: GoogleLoginService,
    public loadingCtrl: LoadingController,
    public constante: Constante
  ) {
    this.main_page = { component: Home };

    this.signup = new FormGroup({
      email: new FormControl('', Validators.compose([Validators.required,Validators.minLength(5),Validators.pattern("[a-z0-9.-_]+@[a-z.]+")])),
      phone: new FormControl('', Validators.compose([Validators.required,Validators.minLength(10),Validators.pattern("^(?:(?:\\+|00)33|0)\\s*[1-9](?:[\\s.-]*\\d{2}){4}$")])),
      nom: new FormControl('', Validators.compose([Validators.required,Validators.minLength(5)])),
      prenom: new FormControl('', Validators.compose([Validators.required,Validators.minLength(3)])),
      password: new FormControl('', Validators.compose([Validators.required,Validators.minLength(5)])),
      confirm_password: new FormControl('', Validators.compose([Validators.required,Validators.minLength(5)])),
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
  doSignup(){
    // Enregistrement du nouveau user
    let user:User = new User();
    user.email = this.signup.get('email').value;
    user.password = this.signup.get("password").value;

    user.phone = this.signup.get("phone").value;
    user.nom = this.signup.get('nom').value;
    user.prenom = this.signup.get('prenom').value;
    let passconf = this.signup.get("confirm_password").value;
    if(passconf!=user.password)
    {
      this.presentToast("Les mots de passe sont différents!");
      this.signup.get("confirm_password").markAsDirty();
      return;
    }
    this.loading = this.loadingCtrl.create({
      content: 'Enregistrement...',
    });
    this.loading.present();



    this.restangular.one("user").post("create",user).subscribe(resp => {
      // Ajout à la liste
      this.loading.dismissAll();
      localStorage.removeItem('id_token');
      localStorage.removeItem('user');
      localStorage.setItem('id_token', resp.id);
      localStorage.setItem('user', JSON.stringify(resp.user));
      this.constante.user=resp.user;
      // let component_page : any = { component: ListeEvent };
      this.nav.setRoot(  ListeEvent );
    }, errorResponse => {
      this.constante.traiteErreur(errorResponse,this);
    });

  }

  doFacebookSignup() {
    this.loading = this.loadingCtrl.create();
    // Here we will check if the user is already logged in
    // because we don't want to ask users to log in each time they open the app
    let env = this;

    this.facebookLoginService.getFacebookUser()
      .then(function(data:FacebookUserModel) {
        // user is previously logged with FB and we have his data we will let him access the app
        // data : name, image,userID
        env.signup_social_fb(data);

      }, function(error){
        //we don't have the user data so we will ask him to log in
        env.facebookLoginService.doFacebookLogin()
          .then(function(data:FacebookUserModel){
            env.loading.dismiss();
            env.signup_social_fb(data);
          }, function(err){
            this.constante.traiteErreur(err,this);
          });
      });
  }

  signup_social_fb(data:FacebookUserModel ){
    let user:User = new User();
    user.id=data.userId;
    user.email=data.email;
    if(data.name.indexOf(" ")!=-1) {
      user.nom = data.name.split(" ")[0];
      user.prenom = data.name.split(" ")[1];
    } else {
      user.nom = data.name;
      user.prenom="--";
    }
    user.urlAvatar=data.image;
    // Connexion réel à l'application
    this.restangular.one("user").post("signup-facebook",user).subscribe(resp => {
      localStorage.setItem('id_token', resp.id);
      localStorage.setItem('user', JSON.stringify(resp.user));
      this.constante.login(resp.user);
      this.nav.setRoot(this.main_page.component);
    }, errorResponse => {
      this.constante.traiteErreur(errorResponse,this);
    });
  }

  signup_social_google(data:GoogleUserModel ){
    let user:User = new User();
    user.id=data.userId;
    user.email=data.email;
    if(data.name.indexOf(" ")!=-1) {
      user.nom = data.name.split(" ")[0];
      user.prenom = data.name.split(" ")[1];
    } else {
      user.nom = data.name;
      user.prenom="--";
    }
    user.urlAvatar=data.image;
    // Connexion réel à l'application
    this.restangular.one("user").post("signup-google",user).subscribe(resp => {
      localStorage.setItem('id_token', resp.id);
      localStorage.setItem('user', JSON.stringify(resp.user));
      this.constante.login(resp.user);
      this.nav.setRoot(this.main_page.component);
    }, errorResponse => {
      this.constante.traiteErreur(errorResponse,this);
    });
  }


  doGoogleSignup() {
    this.loading = this.loadingCtrl.create();

    // Here we will check if the user is already logged in because we don't want to ask users to log in each time they open the app
    let env = this;

    this.googleLoginService.trySilentLogin()
    .then(function(data:GoogleUserModel) {
       // user is previously logged with Google and we have his data we will let him access the app
      env.signup_social_google(data);
    }, function(error){
      //we don't have the user data so we will ask him to log in
      env.googleLoginService.doGoogleLogin()
      .then(function(res:GoogleUserModel){
        env.loading.dismiss();
        env.signup_social_google(res);
      }, function(err){
        env.constante.traiteErreur(err,env);
        env.loading.dismiss();
      });
    });
  }

  showTermsModal() {
    let modal = this.modal.create(PrivacyPolicyPage);
    modal.present();
  }

  showPrivacyModal() {
    let modal = this.modal.create(PrivacyPolicyPage);
    modal.present();
  }

}
