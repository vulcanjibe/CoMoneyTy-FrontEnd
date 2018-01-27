import {Injectable} from "@angular/core";
import {Event, User} from "../cmy-model/cmy.model";
import {Restangular} from 'ngx-restangular';


@Injectable()
export class EventService {

  constructor(private restangular: Restangular){  }

  getEvents(user:User)
  {

    return new Promise<Event>((resolve, reject) => {
      this.restangular.all('user/'+user.id+'/events').getList().subscribe(events => {
          resolve(events);
        }
        ,errorResponse => {
          reject(errorResponse)
        });
    });
  }
}
