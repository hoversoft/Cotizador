import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { NavController } from 'ionic-angular';

/*
  Generated class for the Cc page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-cc',
  templateUrl: 'cc.html'
})
export class CcPage {
  cards;

  constructor(public navCtrl: NavController, public http: Http) {
    this.http.get("assets/cc.json").map(data => {
      this.cards = data.json();
    }).subscribe();
  }
}
