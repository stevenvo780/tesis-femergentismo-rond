import { NodoInterface, IPhysicsRules, PhysicsRules } from './types';
import { nextStep } from './space';
import { crearNodo, expandirEspacio } from './time';


export class Universo {
  public nodos: NodoInterface[] = [];
  public tiempo = 0;
  public valoresSistema: IPhysicsRules;
  public id: string;

  constructor(valoresSistema?: IPhysicsRules) {
    if (valoresSistema) {
      this.valoresSistema = valoresSistema;
    } else {
      this.valoresSistema = Object.keys(PhysicsRules)
        .filter((key) => isNaN(Number(key)))
        .reduce((obj: any, key: any) => {
          obj[key] = PhysicsRules[key];
          return obj;
        }, {} as IPhysicsRules);
    }
    this.nodos = [];
    this.id = this.generarId();
    this.determinacionesDelSistema();
  }

  private generarId(): string {
    return (
      new Date().toISOString() +
      '-' +
      this.valoresSistema.FILAS +
      '-' +
      this.valoresSistema.COLUMNAS +
      '-' +
      Math.random().toString(36).substr(2, 9)
    );
  }

  private deserializarId(id: string): { fecha: string; filas: number; columnas: number; randomString: string } {
    const partes = id.split('-');
    return {
      fecha: partes[0],
      filas: parseInt(partes[1], 10),
      columnas: parseInt(partes[2], 10),
      randomString: partes[3],
    };
  }

  public determinacionesDelSistema() {
    for (let i = 0; i < this.valoresSistema.FILAS; i++) {
      for (let j = 0; j < this.valoresSistema.COLUMNAS; j++) {
        let cargas = Math.random() * 2 - 1;
        let energia = 1 - Math.abs(cargas);
        if (Math.random() > this.valoresSistema.PROBABILIDAD_VIDA_INICIAL) {
          cargas = 0;
          energia = 0;
        }
        const nodo: NodoInterface = crearNodo(i, j, cargas, energia);
        this.nodos.push(nodo);
      }
    }
  }

  public next() {
    this.nodos = nextStep(this.nodos, this.valoresSistema);
    if (this.tiempo % 100 === 0) {
      expandirEspacio(this.nodos, this.valoresSistema);
    }
  }
}
