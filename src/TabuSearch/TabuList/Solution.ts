import { Atribuicao } from "@/context/Global/utils";
import { TabuList } from "../Classes/Abstract/TabuList";
import { Vizinho } from "../Interfaces/utils";
import { atribuicoesIguais } from "../TabuValidation/utils";

export class Solution extends TabuList<Atribuicao[][]> {
  constructor(tabuSize: number | undefined) {
    super(tabuSize);
  }

  add(vizinho: Vizinho): Atribuicao[][] {
    if (this.itens.length === this.tabuSize) {
      this.remove(0);
    }
    this.itens.push(vizinho.atribuicoes);

    return this.itens;
  }

  has(vizinho: Vizinho): boolean {
    return this.itens.some((tabuSet) =>
      vizinho.atribuicoes.every((atribuicao) =>
        tabuSet.some((tabu) => atribuicoesIguais(tabu, atribuicao))
      )
    );
  }

  remove(index: number, indexEnd: number = 1): Atribuicao[][] {
    this.itens.splice(index, indexEnd);

    return this.itens;
  }
}
