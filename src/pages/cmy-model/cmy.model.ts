import { Injectable } from '@angular/core';



export class Constante {
  readonly BASE_URL_REST:string = 'http://vulcanjibe.ddns.net:8080/CoMoneyTy-0.0.1-SNAPSHOT/rest';
  readonly REP_IMAGE:string = 'assets/images/';
  user:User;
}

export class User {
   id: string;
   nom: string;
   prenom: string;
   login: string;
   password: string;
   email: string;
   urlAvatar: string;
}

export class Event {
  id: string;
  libelle: string;
  date: string
  montant: number;
  urlPhoto: string;
}

export class LienEventUser {
  id:string;
  userId:string;
  eventId:string;
  constructor(id1:string,id2:string) {
    this.userId=id1;
    this.eventId=id2;

  }
}

