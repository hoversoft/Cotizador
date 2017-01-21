import { Vehiculo } from './Vehiculo';

export class Zona {
  name: String;
  vehiculos: Vehiculo[]

  constructor(name: String) {
    this.name = name;
    this.vehiculos = new Array<Vehiculo>();
  }

  add(vehiculo: Vehiculo) {
    this.vehiculos.push(vehiculo);
  }
}