import { AspirationCriteria } from "../Classes/Abstract/AspirationCriteria";
import { Vizinho } from "../Interfaces/utils";

export class Objective extends AspirationCriteria {
  constructor(name: string, description: string) {
    super(name, description);
  }

  fulfills(vizinho: Vizinho, melhorVizinho: Vizinho): boolean {
    return vizinho.isTabu && vizinho.avaliacao > melhorVizinho.avaliacao;
  }
}
