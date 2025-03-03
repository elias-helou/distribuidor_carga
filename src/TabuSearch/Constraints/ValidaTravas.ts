import {
  Atribuicao,
  Celula,
  Disciplina,
  Docente,
  TipoTrava,
} from "@/context/Global/utils";
import { ConstraintInterface } from "../Interfaces/utils";
import Constraint from "../Classes/Constraint";

/**
 * Restrição para não permitir a geração de movimentos em turmsa ou docentes com travas
 */
export class ValidaTravas extends Constraint {
  constructor(
    name: string,
    description: string,
    /*algorithm: string,*/
    isHard: boolean,
    penalty: number
  ) {
    super(name, description, isHard, penalty);
  }

  hard(
    atribuicoes?: Atribuicao[],
    docentes?: Docente[],
    disciplinas?: Disciplina[],
    travas?: Celula[]
  ): boolean {
    /**
     * Validar as travas presentes no docente
     */
    for (const docente of docentes) {
      if (
        travas.some(
          (trava) =>
            trava.nome_docente === docente.nome &&
            trava.tipo_trava === TipoTrava.Row
        )
      ) {
        return false;
      }
    }

    /**
     * Valida se a trava está na turma
     */
    for (const turma of disciplinas) {
      if (
        travas.some(
          (trava) =>
            trava.id_disciplina === turma.id &&
            trava.tipo_trava === TipoTrava.Column
        )
      ) {
        return false;
      }
    }

    /**
     * Valida se a trava não está na célula
     */
    for (const turma of disciplinas) {
      for (const docente of docentes) {
        if (
          travas.some(
            (trava) =>
              trava.id_disciplina === turma.id &&
              trava.nome_docente === docente.nome
          )
        ) {
          return false;
        }
      }
    }
    return true;
  }
  toObject(): ConstraintInterface {
    return {
      name: this.name,
      descricao: this.description,
      tipo: this.isHard ? "Hard" : "Soft",
      penalidade: String(this.penalty),
      constraint: ValidaTravas,
    };
  }
}
