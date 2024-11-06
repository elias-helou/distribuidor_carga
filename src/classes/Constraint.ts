import { Atribuicao } from "@/context/Global/utils";

export interface ConstraintInterface {
  readonly name: string;
  isHard: boolean;
  penalty: number;
}

/**
 * Classe que será tomada como base para qualquer restrição que for criada para qualquer método dentro do sistema.
 * Ela obrigará que todas as informações e métodos basicos sejam criados.
 *
 * A ideia é que possamos escolher qual será o comportamento da restrição, podendo ser alterado.
 */
export default abstract class Constraint {
  /**
   * Propriedades
   */
  /**
   * Nome dado a resttição
   */
  readonly name: string;

  /**
   * Detalhes sobre a restrição
   */
  description: string;

  /**
   * Se `true` o comportamento selecionado deve ser this.hard(), caso contrário this.soft().
   */
  isHard: boolean;

  /**
   * Nome do algoritmo que a restrição pertence
   * @ Irei avaliar a necessidade de apresentar o algoritmo na classe Restrição
   */
  //algorithm: string;

  /**
   * Penalidade que será atribuída a função `soft`
   */
  penalty: number;

  /**
   * Construtor
   */
  constructor(
    name: string,
    description: string,
    /*algorithm: string,*/ isHard: boolean,
    penalty: number
  ) {
    this.name = name;
    this.description = description;
    /*this.algorithm = algorithm;*/
    this.isHard = isHard;
    this.penalty = penalty;
  }

  /**
   * Métodos
   */
  abstract soft(): number;
  abstract hard(): boolean;
}

export class DisciplinaSemDocente extends Constraint {
  constructor(
    /*name: string, description: string, algorithm: string,*/ isHard: boolean,
    penalty: number
  ) {
    super("Disciplina sem docente", "", isHard, penalty);
  }

  soft(atribuicoes?: Atribuicao[]): number {
    let avaliacao: number = 0;

    for (const atribuicao of atribuicoes) {
      if (atribuicao.docentes.length === 0) {
        avaliacao -= this.penalty;
      }
    }

    return avaliacao;
  }

  hard(atribuicoes?: Atribuicao[]): boolean {
    for (const atribuicao of atribuicoes) {
      if (atribuicao.docentes.length === 0) {
        return false;
      }
    }

    return true;
  }
}
