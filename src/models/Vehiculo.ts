import { Cobertura } from './Cobertura';


export class Vehiculo {
  name: String;
  prize: number;
  coberturas: Cobertura[];

  constructor(name: String, prize: number) {
    this.name = name;
    this.prize = prize;
    this.coberturas = new Array<Cobertura>();
  }

  add(cobertura: Cobertura) {
    this.coberturas.push(cobertura);
  }

}