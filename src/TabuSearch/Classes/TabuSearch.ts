import {
  Atribuicao,
  Celula,
  Disciplina,
  Docente,
  Formulario,
  Parametros,
  Solucao,
} from "@/context/Global/utils";
import Constraint from "./Constraint";
import { Context, Vizinho } from "../Interfaces/utils";
import { NeighborhoodFunction } from "./Abstract/NeighborhoodFunction";

export class TabuSearch {
  private tabuList;

  /**
   * Solução final após a execução do algoritmo ou a melhor solução encontrada até o momento.
   * O valor é `undefined` até o algoritmo ser executado ou salvo no histórico (solução manual).
   */
  private bestSolution: Solucao | undefined;

  // Informações base para os processos
  private context: Context;

  // Processos de geração de vizinhos
  private neighborhoodPipe: Map<string, NeighborhoodFunction>;

  /**
   * Parâmetros refentes as penalizações, contudo, a classe Constraint apresenta Constraint.penalty
   */
  private parameters: Parametros;

  // Restrições
  private constraints: {
    hard: Map<string, Constraint>;
    soft: Map<string, Constraint>;
  };

  constructor(
    atribuicoes: Atribuicao[],
    docentes: Docente[],
    turmas: Disciplina[],
    travas: Celula[],
    prioridades: Formulario[],
    parametros: Parametros,
    constraints: Constraint[],
    solution: Solucao | undefined,
    neighborhoodFunctions: NeighborhoodFunction[],
    maiorPrioridade?: number
  ) {
    /**
     * Processa as atribuições para virarem um Map
     */
    // const mapAtribuicoes = new Map<string, Atribuicao>();

    // for (const atrib of atribuicoes) {
    //   mapAtribuicoes.set(atrib.id_disciplina, atrib);
    // }

    /**
     * Inicialização do contexto.
     */

    // Se o parâmetro `maiorPrioridade` não for informado, ele deverá ser encontrado.
    if (isNaN(maiorPrioridade)) {
      let maiorPrioridade = 0;
      for (const a of prioridades) {
        if (a.prioridade > maiorPrioridade) {
          maiorPrioridade = a.prioridade;
        }
      }
    }
    this.context = {
      atribuicoes: atribuicoes,
      docentes: docentes,
      turmas: turmas,
      travas: travas,
      prioridades: prioridades,
      maiorPrioridade: maiorPrioridade,
    };

    /**
     * Inicialização dos parâmetros.
     */
    this.parameters = parametros;

    /**
     * Inicializa o Map de Retsrições, atribui as restrições passadas para o contrutor.
     */
    this.constraints = {
      hard: new Map<string, Constraint>(),
      soft: new Map<string, Constraint>(),
    };
    for (const constraint of constraints) {
      if (constraint.isHard) {
        this.constraints.hard.set(constraint.name, constraint);
      } else {
        this.constraints.soft.set(constraint.name, constraint);
      }
    }

    /**
     * Inicialização do atribuito bestSolution para iniciar com uma solução caso já exista e seja informada como parâmetro.
     */
    this.bestSolution = solution;

    /**
     * Inicializa um Map para o Pipe de geração de vizinhanças.
     */
    for (const process of neighborhoodFunctions) {
      this.neighborhoodPipe.set(process.name, process);
    }
  }

  /**
   * Bloco responsável por executar todos od processos definidos para o Pipe Line de geração de vizinhanças.
   * @returns Vizinhança gerada.
   */
  generateNeighborhood(): Vizinho[] {
    const vizinhanca: Vizinho[] = [];

    for (const _process of this.neighborhoodPipe.keys()) {
      /**
       * Criar essa variável para caso não sejam gerados vizinhos, aplicar uma condição de não concatenar
       * na vizinhança global.
       */
      const vizinhancaProcess = this.neighborhoodPipe
        .get(_process)
        .generate(this.context, this.constraints.hard, this.bestSolution);

      if (vizinhancaProcess.length > 0) {
        vizinhanca.concat(vizinhancaProcess);
      }
    }

    return vizinhanca;
  }

  /**
   * Bloco responsável por avaliar a qualidade da solução(vizinhos).
   * @param vizinhanca Vizinhança obtida pelo Pipe Line de geração de vizinhança.
   * @returns Vizinhos com a propriedade `.avaliacao` preenchidos.
   */
  evaluateNeighbors(vizinhanca: Vizinho[]): Vizinho[] {
    for (const vizinho of vizinhanca) {
      let avaliacao = 0;

      /**
       * Aplicar as penalizações na função objetivo
       */
      for (const constraint of this.constraints.soft.values()) {
        avaliacao += constraint.soft(
          vizinho.atribuicoes,
          this.context.docentes,
          this.context.turmas
        );
      }

      /**
       * Aplica o Custo da função objetivo
       */

      for (const atribuicao of vizinho.atribuicoes) {
        const docente: Docente = this.context.docentes.find((d) =>
          atribuicao.docentes.includes(d.nome)
        );

        if (docente.formularios.get(atribuicao.id_disciplina)) {
          avaliacao +=
            this.parameters.k1 *
            (this.context.maiorPrioridade -
              docente.formularios.get(atribuicao.id_disciplina));
        } else {
          /**
           * Para caso exita uma atribuição de um docnete sem formulário preenchido.
           * Apenas para casos de inserção manual.
           */
          avaliacao -= this.parameters.k1;
        }
      }
      vizinho.avaliacao = avaliacao;
    }

    return vizinhanca;
  }
}
