import { StopCriteria } from "../Classes/Abstract/StopCriteria";
import { Vizinho } from "../Interfaces/utils";
import { compararVizihos } from "../utils";

export class IteracoesSemModificacao extends StopCriteria {
  /**
   * Contador iniciará em -1 pois em todo caso, quando uma nova melhor solução for encontrada,
   * teremos a subistituição do `melhorVizinho` e neste caso, o melhor vizinho gerado no processo,
   * comparado com o `melhorVizinho`, serão a mesma solução. Dessa forma o -1 implica o início em 0.
   */
  private iteacoesSemModificacao: number = -1;

  private limiteIteracoesSemModificacao: number;

  constructor(
    name: string,
    descripion: string,
    limiteIteracoesSemModificacao: number
  ) {
    super(name, descripion);
    this.limiteIteracoesSemModificacao = limiteIteracoesSemModificacao;
  }

  stop(
    iteracoes: number,
    melhorVizinho?: Vizinho,
    vizinhoGerado?: Vizinho
  ): boolean {
    /**
     * Verifica a melhor solução atual e o melhor vizinho gerado.
     */
    if (compararVizihos(melhorVizinho, vizinhoGerado)) {
      this.iteacoesSemModificacao += 1;
    } else {
      this.iteacoesSemModificacao = 0;
    }

    return this.iteacoesSemModificacao === this.limiteIteracoesSemModificacao;
  }
}
