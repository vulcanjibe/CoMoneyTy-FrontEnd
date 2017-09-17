import { Injectable } from "@angular/core";
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';


@Injectable()
export class List2EventService {
  constructor(public http: Http) {}

  getData(): Promise<any> {
  //  return this.http.get('./assets/example_data/listEvent.json')
    return this.http.get('http://vulcanjibe.ddns.net:8080/CoMoneyTy-0.0.1-SNAPSHOT/rest/event/get')
     .toPromise()
     .then(response => response.json() )
     .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
