
import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { NavController } from 'ionic-angular';

import * as XLSX from 'xlsx/xlsx';
import 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';

import { Zona } from '../../models/Zona';
import { Vehiculo } from '../../models/Vehiculo';
import { Cobertura } from '../../models/Cobertura';

import { CcPage } from '../cc/cc';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})


export class HomePage {
  importExcelFiles = false;
  zonas: Zona[];
  vehiculos: Vehiculo[];
  coberturas: Cobertura[];
  zona: Zona;
  vehiculo: Vehiculo;
  price: number;
  cards;
  defaultZona: number = 0;
  defaultVehiculo: number = 0;
  showCobertura: Boolean = false;



  constructor(public navCtrl: NavController, public http: Http) {
    this.zonas = this.initZona();
    this.vehiculos = new Array<Vehiculo>();
    this.coberturas = new Array<Cobertura>();

    if (!this.importExcelFiles) {
      this.http.get("assets/cotizaciones.json").map(data => {
        this.zonas = data.json();
        this.zona = this.zonas[this.defaultZona];
        this.vehiculos = this.zona.vehiculos;
        this.vehiculo = this.vehiculos[this.defaultVehiculo];
        this.coberturas = this.vehiculo.coberturas;
        // this.price = 100;
        // this.cotizar();
      }).subscribe();
    }
  }

  getVehiculos(zona: Zona) {
    this.vehiculos = zona.vehiculos;
    this.vehiculo = this.vehiculos[this.defaultVehiculo];
  }

  getCoberturas(vehiculo: Vehiculo) {
    this.coberturas = vehiculo.coberturas;
  }

  cotizar(priceInput) {
    if (this.price == undefined || this.price.toString() == "") {
      priceInput.setFocus();
      this.showCobertura = false;
      return;
    }
    this.showCobertura = true;
    let price = parseFloat(this.price.toString());
    let prize = parseFloat(this.vehiculo.prize.toString().replace(/,/g, ''));

    this.cards = new Array<Cobertura>();
    this.coberturas.forEach(e => {
      if (e.name == "RC") {
        this.cards.push(new Cobertura(e.name, e.value))
      } else {
        let value = parseFloat(e.value.toString());
        let result = ((price * e.value / 1000) + prize) / 4;
        result = parseFloat(result.toFixed(2));
        if (value == 0)
          result = 0;
        this.cards.push(new Cobertura(e.name, result))
      }
    })
  }

  isNumber(event, priceInput) {
    priceInput.setFocus();
    let pattern = /[0-9]+/;
    let value = pattern.exec(event.target.value);
    if (event.target.value == 0 || !value) {
      event.target.value = "";
      return;
    }
    event.target.value = value[0];
  }

  cotizarCC() {
    this.navCtrl.push(CcPage);
  }

  initZona() {
    let array = new Array();
    array.push(new Zona('Cordoba Capital'));
    array.push(new Zona('Cordoba Interior'));
    array.push(new Zona('La Rioja'));
    array.push(new Zona('Catamarca'));
    array.push(new Zona('Tucuman'));
    array.push(new Zona('Salta'));
    array.push(new Zona('Santa Fe'));
    array.push(new Zona('San Luis'));
    array.push(new Zona('Buenos Aires'));
    array.push(new Zona('Chaco'));
    array.push(new Zona('Chubut'));
    array.push(new Zona('Corrientes'));
    array.push(new Zona('Entre Rios'));
    array.push(new Zona('Formosa'));
    array.push(new Zona('Jujuy'));
    array.push(new Zona('La Pampa'));
    array.push(new Zona('Mar del Plata'));
    array.push(new Zona('Mendoza'));
    array.push(new Zona('Misiones'));
    array.push(new Zona('Neuquen'));
    array.push(new Zona('Partido de la Costa'));
    array.push(new Zona('Rio Gallegos'));
    array.push(new Zona('Rio Negro'));
    array.push(new Zona('San Juan'));
    array.push(new Zona('Santiago del Estero'));
    return array;
  }

  getData(fileInput) {
    this.getExcel(fileInput, "C9:M29").subscribe(data => {
      data.forEach(e => {
        let zona = this.zonas.find(x =>
          new RegExp(x.name.toLowerCase()).test(e.file.toLowerCase())
        );
        for (let i = 0; i <= e.data.length - 1; i++) {
          let item = e.data[i];
          let l = item.length;
          let vehiculo = new Vehiculo(item[0], item[2]);
          vehiculo.add(new Cobertura("RC", item[l - 7]))
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
      a.download = "cotizaciones.json";
      a.href = url;
      a.textContent = "Download backup.json";
      a.click();
    })

  }

  getExcel(fileInput: String, range: String): Observable<any> {
    return this.getFileData(fileInput).map(excels => {
      let array = [];
      excels.forEach(excel => {
        let workbook = XLSX.read(excel.data, { type: 'binary' });
        let sheetName = workbook.SheetNames[0];
        let sheet = workbook.Sheets[sheetName];

        let rango = XLSX.utils.decode_range(range);
        let lastRow = sheet[XLSX.utils.encode_cell({ r: rango.e.r, c: rango.s.c })];
        let lastCol = sheet[XLSX.utils.encode_cell({ r: rango.s.r, c: rango.e.c })];
        if (lastRow == undefined) {
          rango.s.r -= 1;
          rango.e.r -= 1;
        }
        if (lastCol == undefined) {
          rango.e.c -= 1;
        }

        rango = XLSX.utils.encode_range(rango);
        array.push({ file: excel.file, data: this.sheetToArray(sheet, rango) });
      })
      return array;
    });
  }

  sheetToArray(sheet: any, range: String): Array<String> {
    let rowList = [];
    let rango = XLSX.utils.decode_range(range);
    for (let R = rango.s.r; R <= rango.e.r; R++) {
      let row = [];
      for (let C = rango.s.c; C <= rango.e.c; C++) {
        let cellName = XLSX.utils.encode_cell({ r: R, c: C });
        let cell = sheet[cellName].w;
        cell = cell.replace(/ +(?= )/g, '');
        row.push(cell);
      }
      rowList.push(row);
    }
    return rowList;
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
}
