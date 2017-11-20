import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';

import  {ListeEvent} from "../cmy-liste-event/cmy-liste-event";

@Component({
  selector: 'forgot-password-page',
  templateUrl: 'forgot-password.html'
})
export class ForgotPasswordPage {
  forgot_password: FormGroup;
  main_page: { component: any };

  constructor(public nav: NavController) {
    this.main_page = { component: ListeEvent };

    this.forgot_password = new FormGroup({
      email: new FormControl('', Validators.required)
    });
  }

  recoverPassword(){
    console.log(this.forgot_password.value);
    this.nav.setRoot(this.main_page.component);
  }

}