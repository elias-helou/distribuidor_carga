import { TabuList } from "../Classes/Abstract/TabuList";
import { Vizinho } from "../Interfaces/utils";
import { atribuicoesIguais } from "../TabuValidation/utils";
import { compararVizihos } from "../utils";

export class Solution extends TabuList<Vizinho[]> {
  constructor(tabuSize: number | undefined) {
    super(tabuSize);
  }

  add(vizinho: Vizinho): Vizinho[] {
    if (this.itens.length === this.tabuSize) {
      this.remove(0);
    }
    this.itens.push(vizinho);

    return this.itens;
  }

  has(vizinho: Vizinho): boolean {
    return this.itens.some((tabuSet) =>
      vizinho.atribuicoes.every((atribuicao) =>
        tabuSet.atribuicoes.some((tabu) => atribuicoesIguais(tabu, atribuicao))
      )
    );
  }

  indexOf(vizinho: Vizinho): number {
    return this.itens.map((value, key) => {
      if (compararVizihos(value, vizinho)) {
        return key;
      }
    })[0];
  }

  remove(index: number, indexEnd: number = 1): Vizinho[] {
    this.itens.splice(index, indexEnd);

    return this.itens;
  }
}
