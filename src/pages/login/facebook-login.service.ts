import {Injectable} from "@angular/core";
import {Http} from '@angular/http';

import {Facebook} from '@ionic-native/facebook';
import {NativeStorage} from '@ionic-native/native-storage';
import {FacebookUserModel} from "../cmy-model/facebook-user.model";


@Injectable()
export class FacebookLoginService {
 // FB_APP_ID: number = 826720427470540;
  FB_APP_ID: number =  712043742320271;

  constructor(
    public http: Http,
    public nativeStorage: NativeStorage,
    public fb: Facebook
  ){
    this.fb.browserInit(this.FB_APP_ID, "v2.11");
  }

  doFacebookLogin()
  {
    let env = this;

    return new Promise<FacebookUserModel>((resolve, reject) => {
      //["public_profile"] is the array of permissions, you can add more if you need
      this.fb.login(["public_profile"]).then(function(response){
        //Getting name and gender properties
        let request:string = "/me?fields=name,gender,email";
        env.fb.api(request, [])
        .then(function(user) {
          //now we have the users info, let's save it in the NativeStorage
          console.log(user);
          let fb_user:FacebookUserModel ={
            userId: user.id,
            email:user.email,
            name: user.name,
            gender: user.gender,
            image: "https://graph.facebook.com/" + user.id + "/picture?type=large",
            friends: null,
            photos: null
          };
          env.nativeStorage.setItem('facebook_user',
            fb_user).then(rep=> {
              resolve(rep);
          },error => {
            reject(error);
          })
        })
      }, function(error){
        reject(error);
      });
    });
  }

  doFacebookLogout()
  {
    let env = this;

    return new Promise((resolve, reject) => {
      this.fb.logout()
      .then(function(res) {
        //user logged out so we will remove him from the NativeStorage
        env.nativeStorage.remove('facebook_user');
        resolve();
      }, function(error){
        reject();
      });
    });
  }

  getFacebookUser()
  {
    return this.nativeStorage.getItem('facebook_user');
  }




  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
