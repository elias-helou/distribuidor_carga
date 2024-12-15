import { Atribuicao, Disciplina, Docente } from "@/context/Global/utils";

// export interface ConstraintInterface {
//   readonly name: string;
//   isHard: boolean;
//   penalty: number;
// }

export interface ConstraintInterface {
  name: string;
  tipo: "Hard" | "Soft";
  penalidade: string;
  descricao: string;
  constraint: new (...args: any[]) => Constraint;
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
  abstract soft(
    atribuicoes?: Atribuicao[],
    docentes?: Docente[],
    disciplinas?: Disciplina[]
  ): number;
  abstract hard(
    atribuicoes?: Atribuicao[],
    docentes?: Docente[],
    disciplinas?: Disciplina[]
  ): boolean;

  abstract toObject(): ConstraintInterface;
}

export class DisciplinaSemDocente extends Constraint {
  constructor(
    name: string,
    description: string,
    /*algorithm: string,*/
    isHard: boolean,
    penalty: number
  ) {
    super(name, description, isHard, penalty);
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

  hard(atribuicoes?: Atribuicao[], docentes?: Docente[]): boolean {
    /**
     * A restrição precisou ser feita desta forma pois na função `podeAtribuir` o valor do docente quando a chamada vem da
     * função `gerarVizinhoComRemocao` se é passado o parâmetro Docente como null. A `podeAtribuir` passa [null].
     */
    return docentes.length > 0 && !docentes.includes(null);
  }

  toObject(): ConstraintInterface {
    return {
      name: this.name,
      descricao: this.description,
      tipo: this.isHard ? "Hard" : "Soft",
      penalidade: String(this.penalty),
      constraint: DisciplinaSemDocente,
    };
  }
}

export class ChoqueDeHorarios extends Constraint {
  constructor(
    name: string,
    description: string,
    /*algorithm: string,*/
    isHard: boolean,
    penalty: number
  ) {
    super(name, description, isHard, penalty);
  }

  soft(
    atribuicoes?: Atribuicao[],
    docentes?: Docente[],
    disciplinas?: Disciplina[]
  ): number {
    let avaliacao: number = 0;

    // Penalizar solução para cada choque de horários encontrados nas atribuições dos docentes
    for (const docente of docentes) {
      // Lista com os Ids das disciplinas
      const atribuicoesDocente: string[] = atribuicoes
        .filter((atribuicao) => atribuicao.docentes.includes(docente.nome))
        .map((atribuicao) => atribuicao.id_disciplina);

      // Comparar as atribuições para ver se a `Disciplia.conflitos` não incluem umas as outras
      for (let i = 0; i < atribuicoesDocente.length; i++) {
        const disciplinaPivo: Disciplina = disciplinas.find(
          (disciplina) => disciplina.id === atribuicoesDocente[i]
        );

        for (let j = i + 1; j < atribuicoesDocente.length; j++) {
          const disciplinaAtual: Disciplina = disciplinas.find(
            (disciplina) => disciplina.id === atribuicoesDocente[j]
          );

          if (disciplinaPivo.conflitos.has(disciplinaAtual.id)) {
            // k2 penaliza conflitos
            avaliacao -= this.penalty;
          }
        }
      }
    }

    return avaliacao;
  }

  hard(
    atribuicoes?: Atribuicao[],
    docentes?: Docente[],
    disciplinas?: Disciplina[]
  ): boolean {
    if (atribuicoes !== undefined) {
      // Penalizar solução para cada choque de horários encontrados nas atribuições dos docentes
      for (const docente of docentes) {
        // Lista com os Ids das disciplinas
        const atribuicoesDocente: string[] = atribuicoes
          .filter((atribuicao) => atribuicao.docentes.includes(docente.nome))
          .map((atribuicao) => atribuicao.id_disciplina);

        // Comparar as atribuições para ver se a `Disciplia.conflitos` não incluem umas as outras
        for (let i = 0; i < atribuicoesDocente.length; i++) {
          const disciplinaPivo: Disciplina = disciplinas.find(
            (disciplina) => disciplina.id === atribuicoesDocente[i]
          );

          for (let j = i + 1; j < atribuicoesDocente.length; j++) {
            const disciplinaAtual: Disciplina = disciplinas.find(
              (disciplina) => disciplina.id === atribuicoesDocente[j]
            );

            if (disciplinaPivo.conflitos.has(disciplinaAtual.id)) {
              // k2 penaliza conflitos
              return false;
            }
          }
        }
      }
    }

    /**
     * TODO: Repensar para quando essa restrição for para verificar apenas um docente com uma disciplina
     */

    return true;
  }

  toObject(): ConstraintInterface {
    return {
      name: this.name,
      descricao: this.description,
      tipo: this.isHard ? "Hard" : "Soft",
      penalidade: String(this.penalty),
      constraint: ChoqueDeHorarios,
    };
  }
}

export class AtribuicaoSemFormulario extends Constraint {
  constructor(
    name: string,
    description: string,
    /*algorithm: string,*/
    isHard: boolean,
    penalty: number
  ) {
    super(name, description, isHard, penalty);
  }

  soft(
    atribuicoes?: Atribuicao[],
    docentes?: Docente[]
    //disciplinas?: Disciplina[]
  ): number {
    let avaliacao: number = 0;

    // for (const docente of docentes) {
    //   const docenteAtribuicoes = atribuicoes.filter((atribuicao) =>
    //     atribuicao.docentes.includes(docente.nome)
    //   );

    //   for (const atribuicao of docenteAtribuicoes) {
    //     if (!docente.formularios.has(atribuicao.id_disciplina)) {
    //       avaliacao -= this.penalty;
    //     }
    //   }
    // }
    for (const atribuicao of atribuicoes) {
      for (const docenteAtribuido of atribuicao.docentes) {
        const docente = docentes.find((obj) => obj.nome === docenteAtribuido);

        if (!docente.formularios.has(atribuicao.id_disciplina)) {
          avaliacao -= this.penalty;
        }
      }
    }

    return avaliacao;
  }

  hard(
    atribuicoes?: Atribuicao[],
    docentes?: Docente[],
    disciplinas?: Disciplina[]
  ): boolean {
    /**
     * Se a disciplina não foi informado quer dizer que estamos verificando todo o contexto
     */
    if (disciplinas === undefined && atribuicoes !== undefined) {
      for (const docente of docentes) {
        const docenteAtribuicoes = atribuicoes.filter((atribuicao) =>
          atribuicao.docentes.includes(docente.nome)
        );

        for (const atribuicao of docenteAtribuicoes) {
          if (!docente.formularios.has(atribuicao.id_disciplina)) {
            return false;
          }
        }
      }
    } else {
      // Se a disciplina foi informado quer dizer que estamos verificando um contexto específico
      for (const docente of docentes) {
        for (const disciplia of disciplinas) {
          if (!docente.formularios.has(disciplia.id)) {
            return false;
          }
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
      constraint: AtribuicaoSemFormulario,
    };
  }
}
