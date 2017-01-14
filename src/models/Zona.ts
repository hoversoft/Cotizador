import { Vehiculo } from './Vehiculo';

export class Zona {
  name: String;
  key: String;
  selected: Boolean;
  vehiculos: Vehiculo[]

  constructor(name: String, key: String, selected?: Boolean) {
    this.name = name;
    this.key = key;
    this.selected = selected || false;
    this.vehiculos = new Array<Vehiculo>();
  }

  add(vehiculo: Vehiculo) {
    this.vehiculos.push(vehiculo);
  }
}