import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { GooglePlus } from '@ionic-native/google-plus';
import { NativeStorage } from '@ionic-native/native-storage';
import {GoogleUserModel} from "../cmy-model/google-user.model";


@Injectable()
export class GoogleLoginService {

  //webClientId: string = "1001905109734-cnkoa7unjev55lii0rftbfm0kvb37gqr.apps.googleusercontent.com";
 // webClientId: string = "272824026885-hv3ivie6j8iv86gt2aj1q2fb4cqf03po.apps.googleusercontent.com";
  // ou bien webClientId: string = "144202714235-r2f4grqrnl9obs93d26mv4a50hg9d9na.apps.googleusercontent.com"
  webClientId: string = "144202714235-fn6dv72gusevj4verqnmlve1jjh29mt8.apps.googleusercontent.com";
  constructor(
    public http: Http,
    public nativeStorage: NativeStorage,
    public googlePlus: GooglePlus
  ) {}

  trySilentLogin()
  {
    //checks if user is already signed in to the app and sign them in silently if they are.
    let env = this;
    return new Promise<GoogleUserModel>((resolve, reject) => {
      env.googlePlus.trySilentLogin({
        'scopes': '', // optional, space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
        'webClientId': this.webClientId, // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
        'offline': true
      })
      .then(function (user) {
        //now we have the users info, let's save it in the NativeStorage
        console.log(user);
        let google_user:GoogleUserModel ={
          userId: user.userId,
          email:user.email,
          name: user.displayName,
          image: user.imageUrl,
          friends: null,
          photos: null
        };
        env.nativeStorage.setItem('google_user',
          google_user).then(rep=> {
          resolve(rep);
        },error => {
          reject(error);
        })
      }, function (error) {
        reject(error);
      });
    });
  }

  doGoogleLogin()
  {
    let env = this;

    return new Promise<GoogleUserModel>((resolve, reject) => {

      env.googlePlus.login({
        'scopes': '', // optional, space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
        'webClientId': this.webClientId, // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
        'offline': true
      })
      .then(function (user) {
        console.log(user);
        let google_user:GoogleUserModel ={
          userId: user.userId,
          email:user.email,
          name: user.displayName,
          image: user.imageUrl,
          friends: null,
          photos: null
        };
        env.nativeStorage.setItem('google_user',
          google_user).then(rep=> {
          resolve(rep);
        },error => {
          reject(error);
        })
      }, function (error) {
        reject(error);
      });
    });
  }

  doGoogleLogout()
  {
    let env = this;
    return new Promise((resolve, reject) => {
      this.googlePlus.logout()
      .then(function(response) {
        //user logged out so we will remove him from the NativeStorage
        env.nativeStorage.remove('google_user');
        resolve();
      }, function(error){
        reject(error);
      });
    });
  }

  getGoogleUser()
  {
    return this.nativeStorage.getItem('google_user');
  }


  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }


}
