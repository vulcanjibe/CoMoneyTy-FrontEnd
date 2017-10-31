import {Component, ElementRef, ViewChild} from '@angular/core';
import {Constante} from "../../pages/cmy-model/cmy.model";



@Component({
  selector: 'menu-circular',
  templateUrl: 'menu-circular.html'
})
export class MenuCircular {
  buttons:Array<Button>;
  objet:any;
  parent:any;
  openMenu:boolean = false;
  visible:boolean = false;
  photo:string;

  constructor(private constante:Constante) {
    this.buttons=new Array();
  }
  close() {
    this.visible=false;
  //  this.parent.cover.nativeElement.style.display="none";
    this.openMenu = false;
    this.parent.visible=false;
  }
  action(button:Button)
  {
    console.log("Go sur "+button.sousMenu.action);
    let fonction = button.sousMenu.action;
    fonction.call(this.parent,this.objet);
  }
  config(sousmenus:Array<SousMenu>) {
    for(let sousmenu of sousmenus)
    {
      let button = new Button(sousmenu);
      this.buttons.push(button);
    }

    let i=0;
    let l= this.buttons.length;
    for(let button of this.buttons) {
      button.left = (50 - 35*Math.cos(-0.5 * Math.PI - 2*(1/l)*i*Math.PI)).toFixed(4) + "%";
      button.top = (50 + 35*Math.sin(-0.5 * Math.PI - 2*(1/l)*i*Math.PI)).toFixed(4) + "%";
      i++;
    }
  }
  show(parent:Component,obj:any,urlPhoto:string) {
    this.parent=parent;
    this.visible=true;
 //   this.parent.cover.nativeElement.style.display="block";
    this.objet=obj;
    this.photo=urlPhoto;
    this.openMenu = false;
  }
  hide() {
    this.visible=false;
  }
  toggle() {
    this.openMenu = !this.openMenu;
  }

  blockEvent() {
    console.log("Il faut bloquer!!!");
//    this.parent.cover.nativeElement.style.display="none";
    this.hide();
  }
}

export class SousMenu {
  libelle:string;
  icon:string;
  action:Function;
  constructor(libelle,action,icon) {
    this.libelle = libelle;
    this.action = action;
    this.icon = icon;
  }
}
class Button {
  left:string;
  top:string;
  sousMenu:SousMenu;
  constructor(sm:SousMenu) {
    this.sousMenu=sm;
  }
  getStyle() {
    return { 'top':this.top, 'left':this.left};
  }
}
