import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

/*
  Generated class for the CardInfo page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-card-info',
  templateUrl: 'card-info.html'
})
export class CardInfoPage {
  card;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.card = this.navParams.data;
  }

}
