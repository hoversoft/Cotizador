import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { NavController } from 'ionic-angular';
import { CardInfoPage } from '../card-info/card-info';

// declare var XLSX: any;

import * as XLSX from 'xlsx/xlsx';
import 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';

import { Zona } from '../../models/Zona';
import { Vehiculo } from '../../models/Vehiculo';
import { Cobertura } from '../../models/Cobertura';

//Type parameter for getExcel
type ExcelRange = { start: { row: number, column: number }, end: { row: number, column: number } };
type ExcelAlign = "all" | "perRow" | "perCol";


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})


export class HomePage {
  importExcelFiles = false;
  zonas: Zona[];
  vehiculos: Vehiculo[];
  coberturas: Cobertura[];
  cards;
  price: number;
  zona: Zona;
  vehiculo: Vehiculo;

  constructor(public navCtrl: NavController, public http: Http) {
    this.zonas = this.initZona();
    this.vehiculos = new Array<Vehiculo>();
    this.coberturas = new Array<Cobertura>();

    if (!this.importExcelFiles) {
      this.http.get("assets/info.json").map(data => {
        this.zonas = data.json();
        this.zona = this.zonas.find(x => x.selected == true);
        this.vehiculos = this.zona.vehiculos;
        this.vehiculo = this.vehiculos[0];
        this.coberturas = this.vehiculo.coberturas;
      }).subscribe();
    }

  }

  getVehiculos(zona: Zona) {
    this.vehiculos = zona.vehiculos;
  }

  getCoberturas(vehiculo: Vehiculo) {
    this.coberturas = vehiculo.coberturas;
  }

  cotizar() {
    if (this.price == undefined) {
      return;
    }
    let price = parseFloat(this.price.toString());
    let prize = parseFloat(this.vehiculo.prize.toString());
    this.cards = new Array<Cobertura>();
    this.coberturas.forEach(e => {
      let value = parseFloat(e.value.toString());
      let result = ((price * e.value / 1000) + prize) / 4;
      result = parseFloat(result.toFixed(2));
      if (value == 0)
        result = 0;
      this.cards.push(new Cobertura(e.name, result))
    })
  }

  initZona() {
    let array = new Array();
    array.push(new Zona('Cordoba Capital', 'CB', true));
    array.push(new Zona('Cordoba Interior', 'CBI'));
    array.push(new Zona('Buenos Aires', 'BA'));
    array.push(new Zona('Catamarca', 'CAT'));
    array.push(new Zona('Chaco', 'CHA'));
    array.push(new Zona('Chubut', 'CHU'));
    array.push(new Zona('Corrientes', 'COR'));
    array.push(new Zona('Entre Rios', 'ER'));
    array.push(new Zona('Formosa', 'FOR'));
    array.push(new Zona('Jujuy', 'JU'));
    array.push(new Zona('La Pampa', 'PAM'));
    array.push(new Zona('La Rioja', 'RIO'));
    array.push(new Zona('Mar del Plata', 'MP'));
    array.push(new Zona('Mendoza', 'MEN'));
    array.push(new Zona('Misiones', 'MIS'));
    array.push(new Zona('Neuquen', 'NEU'));
    array.push(new Zona('Partido de la Costa', 'PC'));
    array.push(new Zona('Rio Gallegos', 'RG'));
    array.push(new Zona('Rio Negro', 'RN'));
    array.push(new Zona('Salta', 'SAL'));
    array.push(new Zona('San Juan', 'SJ'));
    array.push(new Zona('San Luis', 'SL'));
    array.push(new Zona('Santa Fe', 'SF'));
    array.push(new Zona('Santiago del Estero', 'SE'));
    array.push(new Zona('Tucuman', 'TUC'));
    return array;
  }

  getData(fileInput) {
    let cellRange = {
      start: { row: 8, column: 2 },
      end: { row: 28, column: 11 }
    }
    this.getExcel(fileInput, cellRange, "perRow").subscribe(data => {
      data.forEach(e => {
        let zona = this.zonas.find(x =>
          new RegExp(x.name.toLowerCase()).test(e.file.toLowerCase())
        );
        for (let i = 0; i <= e.data.length - 1; i++) {
          let item = e.data[i];
          let l = item.length;
          console.log(zona);
          let vehiculo = new Vehiculo(item[0], item[2]);
          vehiculo.add(new Cobertura("B", item[l - 6]))
          vehiculo.add(new Cobertura("B1", item[l - 5]))
          vehiculo.add(new Cobertura("BX", item[l - 4]))
          vehiculo.add(new Cobertura("C", item[l - 3]))
          vehiculo.add(new Cobertura("C1", item[l - 2]))
          vehiculo.add(new Cobertura("CGLASS", item[l - 1]))
          zona.add(vehiculo);
        }
      });
      var json = JSON.stringify(this.zonas);
      var blob = new Blob([json], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.download = "backup.json";
      a.href = url;
      a.textContent = "Download backup.json";
      a.click();
    })

  }


  getExcel(fileInput: String, cellRange: ExcelRange, config: ExcelAlign): Observable<any> {
    return this.getFileData(fileInput).map(data => {
      let array = [];
      data.forEach(e => {
        let workbook = XLSX.read(e.data, { type: 'binary' });
        let sheetName = workbook.SheetNames[0];
        let sheet = workbook.Sheets[sheetName];
        array.push({ file: e.file, data: this.alignExcel(sheet, cellRange, config) });
      })
      return array;
    });
  }

  alignExcel(sheet, cellRange: ExcelRange, config: ExcelAlign): Array<any> {
    let dataRange = [];
    let dataLine = [];
    let sStart;
    let sEnd;
    let eStart;
    let eEnd;
    if (config == "perCol") {
      sStart = cellRange.start.column
      sEnd = cellRange.end.column
      eStart = cellRange.start.row
      eEnd = cellRange.end.row
    } else {
      sStart = cellRange.start.row
      sEnd = cellRange.end.row
      eStart = cellRange.start.column
      eEnd = cellRange.end.column
    }
    for (let i = sStart; i <= sEnd; i++) {
      for (let j = eStart; j <= eEnd; j++) {
        let cellAddress = (config == "perCol") ? { r: j, c: i } : { r: i, c: j };
        let cellName = XLSX.utils.encode_cell(cellAddress);
        let data;
        if (sheet[cellName] != undefined) {
          data = sheet[cellName].v;
        }
        //Remove all spaces
        if (typeof data === "string")
          data = data.replace(/ +(?= )/g, '');
        //Two digits after comma
        if (typeof data === "number")
          data = data.toFixed(2);
        if (config == "all")
          dataRange.push(data);
        if (config == "perRow" || config == "perCol")
          dataLine.push(data);

      }
      if (config == "perRow" || config == "perCol") {
        dataRange.push(dataLine);
        dataLine = [];
      }
    }
    return dataRange;
  }

  getFileData(fileInput): Observable<any> {
    return Observable.create(o => {
      let files = fileInput.target.files;
      let i, f;
      let array = [];
      let count = 0;
      for (i = 0; i < files.length; i++) {
        f = files[i]
        let reader = new FileReader();
        let file = f.name;
        reader.onload = (e: any) => {
          count++;
          array.push({ file: file, data: e.target.result });
          if (i == count) {
            o.next(array);
          }
        };
        reader.readAsBinaryString(f);
      }
    })
  }

  sendInfoCard(card: Cobertura) {
    if (card.value == 0)
      return;
    this.navCtrl.push(CardInfoPage, card);
  }
}
