import { Celula, Disciplina, Docente, TipoTrava } from "@/context/Global/utils";
import Constraint from "../Classes/Constraint";

/**
 * Função para checar se um docente pode ser alocado a uma disciplina
 * @param {Docente} docente
 * @param {Disciplina} disciplina
 * @param {Trava[]} travas
 * @param {Atribuicao[]} atribuicoes
 * @param {Disciplina[]} disciplinas
 * @returns {Boolean} Indicação se a atribuição do docente X à disciplina Y pode ser realizada.
 */
export function podeAtribuir(
  docente: Docente,
  turma: Disciplina,
  travas: Celula[],
  hardConstraints: Map<string, Constraint>
): boolean {
  if (
    docente !== null &&
    travas.some(
      (trava) =>
        trava.id_disciplina === turma.id && trava.nome_docente === docente.nome
    )
  ) {
    return false;
  }

  if (
    !turma.ativo ||
    travas.some(
      (trava) =>
        trava.id_disciplina === turma.id &&
        trava.tipo_trava === TipoTrava.Column
    )
  ) {
    return false;
  }
  for (const _constraint of hardConstraints.keys()) {
    const constraint = hardConstraints.get(_constraint);
    if (!constraint.hard(undefined, [docente], [turma])) {
      return false;
    }
  }

  return true;
}
