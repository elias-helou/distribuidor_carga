import { Atribuicao, Docente } from "@/context/Global/utils";
import { ConstraintInterface } from "../Interfaces/utils";
import Constraint from "../Classes/Constraint";

/**
 * Penaliza a quantidade de carga de trabalho baseada nos saldos dos docentes.
 */
export class CargaDeTrabalho extends Constraint {
  constructor(
    name: string,
    description: string,
    /*algorithm: string,*/
    isHard: boolean,
    penalty: number
  ) {
    super(name, description, isHard, penalty);
  }

  soft(atribuicoes: Atribuicao[], docentes: Docente[]): number {
    let avaliacao: number = 0;
    /**
     * Contar a quantidade de atribuições por docente
     */
    const qtdAtribDocentes = new Map<string, number>();
    for (const docente of docentes) {
      const qtd = atribuicoes.filter((atribuicao) =>
        atribuicao.docentes.includes(docente.nome)
      ).length;
      qtdAtribDocentes.set(docente.nome, qtd);
    }

    /**
     * Penalização com base no saldo
     */
    for (const docente of docentes) {
      if (qtdAtribDocentes.get(docente.nome) > 2) {
        avaliacao -= this.penalty * (docente.saldo < -1.0 ? 0.75 : 1.0);
      } else if (qtdAtribDocentes.get(docente.nome) < 1) {
        avaliacao -= this.penalty * (docente.saldo > 1.0 ? 1.0 : 0.75);
      }
    }

    return avaliacao;
  }

  toObject(): ConstraintInterface {
    return {
      name: this.name,
      descricao: this.description,
      tipo: this.isHard ? "Hard" : "Soft",
      penalidade: String(this.penalty),
      constraint: CargaDeTrabalho,
    };
  }
}
