import { Universo } from './universo';
import { NodoInterface, PhysicsRules, IPhysicsRules, SystemRules } from './types';

export class Entrenador {
  public universo: Universo;
  public tiempoLimiteSinEstructuras = SystemRules.TIEMPO_LIMITE_ESTRUCTURA;
  public pesos: IPhysicsRules;
  public tasaDeAprendizaje = 0.05;

  private tiempoSinEstructuras = 0;

  constructor() {
    this.universo = new Universo();
    this.pesos = Object.keys(PhysicsRules)
      .filter((key) => isNaN(Number(key)))
      .reduce((obj: any, key: any) => {
        obj[key] = PhysicsRules[key];
        return obj;
      }, {} as IPhysicsRules);
    this.nextStepRecursivo();
  }

  private nextStepRecursivo() {
    this.universo.next();
    this.universo.tiempo++;
    const visualizar = this.universo.tiempo % this.tiempoLimiteSinEstructuras;
    if (visualizar === 0) {
      this.entrenarPerpetuo()
    }

    setTimeout(() => this.nextStepRecursivo(), 0);
  }

  private calcularRecompensa(nodos: NodoInterface[]): number {
    return this.detectarEstructuras(nodos);
  }

  private actualizarPesos(recompensa: number) {
    const claves = Object.keys(this.pesos) as (keyof IPhysicsRules)[];
    claves.forEach((clave) => {
      if (
        clave === 'COLUMNAS' ||
        clave === 'FILAS' ||
        clave === 'CRECIMIENTO_X' ||
        clave === 'CRECIMIENTO_Y'
      ) {
        return; // No modificar estos valores
      }

      let ajuste = Math.random() * 0.1 - 0.05;
      if (
        clave === 'LIMITE_RELACIONAL' ||
        clave === 'DISTANCIA_MAXIMA_RELACION' ||
        clave === 'ESPERADO_EMERGENTE' ||
        clave === 'FACTOR_RELACION'
      ) {
        ajuste = Math.round(ajuste);
      }

      const cambio = this.tasaDeAprendizaje * recompensa * ajuste;
      this.pesos[clave]! += cambio;
    });
  }

  public actualizarConfiguracion(
    tiempoLimiteSinEstructuras: number,
    tasaDeAprendizaje: number
  ) {
    this.tiempoLimiteSinEstructuras = tiempoLimiteSinEstructuras;
    this.tasaDeAprendizaje = tasaDeAprendizaje;
  }

  private detectarEstructuras(nodos: NodoInterface[]): number {
    let numeroDeEstructuras = 0;
    const nodosVisitados = new Set<string>();

    nodos.forEach((nodo) => {
      if (nodosVisitados.has(nodo.id)) return;
      const nodosRelacionados = nodo.memoria.relaciones.map(
        (rel) => rel.nodoId,
      );
      if (
        nodosRelacionados.length >=
        this.universo.valoresSistema.ESPERADO_EMERGENTE
      ) {
        const esEstructuraValida = nodosRelacionados.every((idRelacionado) => {
          const nodoRelacionado = nodos.find((n) => n.id === idRelacionado);
          return (
            nodoRelacionado &&
            nodoRelacionado.memoria.energia >
            this.universo.valoresSistema.ENERGIA
          );
        });

        if (esEstructuraValida) {
          nodosRelacionados.forEach((idRelacionado) =>
            nodosVisitados.add(idRelacionado),
          );
          numeroDeEstructuras++;
        }
      }
    });

    return numeroDeEstructuras;
  }

  private reiniciarUniverso(): void {
    this.universo = new Universo(this.pesos);
    this.universo.valoresSistema.COLUMNAS = PhysicsRules.COLUMNAS;
    this.universo.valoresSistema.FILAS = PhysicsRules.FILAS;
  }

  private entrenarPerpetuo() {
    console.log("Tiempo sin estructura", this.tiempoSinEstructuras);
    if (this.hayEstructuras(this.universo.nodos)) {
      this.tiempoSinEstructuras = 0;
    } else {
      this.tiempoSinEstructuras++;
      if (this.tiempoSinEstructuras >= this.tiempoLimiteSinEstructuras) {
        this.reiniciarUniverso();
        this.tiempoSinEstructuras = 0;
      }
    }
    const recompensa = this.calcularRecompensa(this.universo.nodos);
    this.actualizarPesos(recompensa);
  }

  private hayEstructuras(nodos: NodoInterface[]): boolean {
    return this.detectarEstructuras(nodos) > 0;
  }
}
