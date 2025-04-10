import { Vizinho } from "../Interfaces/utils";

export enum MovimentType {
  Add /** Movimento de adicionar um docente */,
  Drop /** Movimento de remover */,
}

export interface Movimentos {
  add: Movimento[];
  drop: Movimento[];
}

export interface Movimento {
  turmaId: string;
  docente: string;
}

export class Moviment {
  public tenures: { add: number; drop: number };

  /**
   * A lista **Add** define quando um movimento **previamente removido**
   * poderá ser novamente permitido.
   *
   * key: turmaId,docente
   * value: iteração que o movimento ficará disponível
   */
  public addList: Map<string, number>;

  /**
   * A lista **Drop** armazena os **movimentos adicionados**,
   * determinando quando poderão ser revertidos.
   *
   * key: turmaId,docente
   * value: iteração que o movimento ficará disponível
   */
  public dropList: Map<string, number>;

  constructor(addTenure: number, dropTenure: number) {
    this.tenures = { add: addTenure, drop: dropTenure };

    this.addList = new Map<string, number>();
    this.dropList = new Map<string, number>();
  }

  add(vizinho: Vizinho, iteracaoAtual: number) {
    /** Lembrar que o Add do ENUM é para ser inserido na ``dropList`` */
    for (const movimento of vizinho.movimentos.add) {
      const key = `${movimento.turmaId},${movimento.docente}`;
      this.dropList.set(key, iteracaoAtual + this.tenures.drop);
    }

    for (const movimento of vizinho.movimentos.drop) {
      const key = `${movimento.turmaId},${movimento.docente}`;
      this.addList.set(key, iteracaoAtual + this.tenures.add);
    }
  }

  /**
   * O Drop deve impedir que outro movimento seja realizado naquela mesma turma
   */
  has(vizinho: Vizinho, iteracaoAtual: number): boolean {
    const dropActive = Array.from(this.dropList.keys())
      .filter((key) => this.dropList.get(key) >= iteracaoAtual)
      .map((key) => key.split(",")[0]);
    for (const movimento of vizinho.movimentos.add) {
      //   const key = `${movimento.turmaId},${movimento.docente}`;
      //   if (this.dropList.has(key) && this.dropList.get(key) >= iteracaoAtual) {
      //     return true;
      //   }
      if (dropActive.includes(movimento.turmaId)) {
        return true;
      }
    }

    for (const movimento of vizinho.movimentos.drop) {
      const key = `${movimento.turmaId},${movimento.docente}`;
      if (this.addList.has(key) && this.addList.get(key) >= iteracaoAtual) {
        return true;
      }
    }
    return false;
  }
}
