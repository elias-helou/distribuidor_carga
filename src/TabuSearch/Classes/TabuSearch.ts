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
import { Context, Statistics, Vizinho } from "../Interfaces/utils";
import { NeighborhoodFunction } from "./Abstract/NeighborhoodFunction";
import { TabuList } from "./Abstract/TabuList";
import { Solution } from "../TabuList/Solution";
import { delay } from "../utils";

export class TabuSearch {
  /**
   * Lista tabu com a sua tipagem dinâmica devido a possibilidades de diferentes interpretações.
   */
  private tabuList: TabuList<any>;

  /**
   * Solução final após a execução do algoritmo ou a melhor solução encontrada até o momento.
   * O valor é `undefined` até o algoritmo ser executado ou salvo no histórico (solução manual).
   */
  public bestSolution: Vizinho | undefined;

  // Informações base para os processos
  protected context: Context;

  // Processos de geração de vizinhos
  private neighborhoodPipe: Map<string, NeighborhoodFunction> = new Map<
    string,
    NeighborhoodFunction
  >();

  /**
   * Parâmetros refentes as penalizações, contudo, a classe Constraint apresenta Constraint.penalty
   */
  public parameters: Parametros;

  // Restrições
  protected constraints: {
    hard: Map<string, Constraint>;
    soft: Map<string, Constraint>;
  };

  /**
   * Estatísticas referentes a execução do algoritmo
   */
  public statistics: Statistics;

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
    tipoTabuList: "Solução" | "Atribuição" | "Movimento",
    tabuSize: number | undefined,
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
    if (solution) {
      this.bestSolution = {
        atribuicoes: solution.atribuicoes,
        isTabu: false,
        movimentos: { add: [], drop: [] },
        avaliacao: solution.avaliacao,
      };
    } else {
      this.bestSolution = {
        atribuicoes: atribuicoes,
        isTabu: false,
        movimentos: { add: [], drop: [] },
        avaliacao: undefined,
      };
    }

    /**
     * Inicializa um Map para o Pipe de geração de vizinhanças.
     */
    for (const process of neighborhoodFunctions) {
      this.neighborhoodPipe.set(process.name, process);
    }

    /**
     * Inicializar a lista tabu com tipagem correta.
     */
    if (tipoTabuList === "Solução") {
      this.tabuList = new Solution(tabuSize);
    } // TODO: Implementar os demais casos quando as classes forem criadas.

    /**
     * Inicializar a propriedade `statistics`
     */
    this.statistics = {
      avaliacaoPorIteracao: new Map<number, number>(),
      interrupcao: false,
      iteracoes: 0,
      tempoExecucao: 0,
      tempoPorIteracao: new Map<number, number>(),
    };
  }

  /**
   * Bloco responsável por executar todos od processos definidos para o Pipe Line de geração de vizinhanças.
   * @returns Vizinhança gerada.
   */
  async generateNeighborhood(): Promise<Vizinho[]> {
    const vizinhanca: Vizinho[] = [];

    for (const _process of this.neighborhoodPipe.keys()) {
      /**
       * Criar essa variável para caso não sejam gerados vizinhos, aplicar uma condição de não concatenar
       * na vizinhança global.
       */
      const vizinhancaProcess = await this.neighborhoodPipe
        .get(_process)
        .generate(this.context, this.constraints.hard, this.bestSolution);

      if (vizinhancaProcess.length > 0) {
        vizinhanca.push(...vizinhancaProcess);
      }
    }

    return vizinhanca;
  }

  /**
   * Bloco responsável por avaliar a qualidade da solução(vizinhos).
   * @param vizinhanca Vizinhança obtida pelo Pipe Line de geração de vizinhança.
   * @returns Vizinhos com a propriedade `.avaliacao` preenchidos.
   */
  async evaluateNeighbors(vizinhanca: Vizinho[]): Promise<Vizinho[]> {
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
       * Posteriormente essa parte também pode ser subistituída por um pipe line
       */

      for (const atribuicao of vizinho.atribuicoes) {
        for (const docenteAtribuido of atribuicao.docentes) {
          const docente: Docente = this.context.docentes.find(
            (d) => d.nome === docenteAtribuido
          );

          /**
           * Caso não exista um docente atribuído a turma, o processo deve ir para a próxima iteração.
           * Penalização já aplicada anteriormente.
           */
          if (!docente) {
            continue;
          }

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
    }

    return vizinhanca;
  }

  /**
   * Bloco 5548956leticia
   * Bloco responsável por verificar se o(s) movimento(s) realizado(s) é/são tabu. Essa verificação
   * deve alterar a propriedade `.isTabu` da interface `Vizinho`.
   *
   * O processo de verificação deve ser modularizado para que possa ser possível implementar
   * as variações da lista tabu.
   *
   * **Variações**:
   * - Soluções
   * - Atributos
   * - Movimentos
   */
  async verifyTabu(vizinhanca: Vizinho[]): Promise<Vizinho[]> {
    for (const vizinho of vizinhanca) {
      vizinho.isTabu = this.tabuList.has(vizinho);
    }
    return vizinhanca;
  }

  /**
   * (Provisório) Método que define se o processo deve ser encerrado.
   */
  async stop(iteracoes: number, interrompe?: () => boolean) {
    return iteracoes === 100 || (interrompe && interrompe());
  }

  /**
   *
   * @param interrompe Função que pode ser informada ao método run com o intuito de interromper a execução do algoritmo.
   * @returns
   */
  async run(
    interrompe?: () => boolean,
    atualizaQuantidadeAlocacoes?: (qtd: number) => void
  ): Promise<Vizinho> {
    let iteracoes = 0;
    let vizinhanca: Vizinho[];
    /**
     * Variáveis para o controle do tempo de execução. Também serão utilizados nas estatisticas.
     */
    let tempoInicial: number; // Por iteração
    let tempoFinal: number; // Por iteração

    if (!this.bestSolution.avaliacao) {
      this.bestSolution = (
        await this.evaluateNeighbors([this.bestSolution])
      )[0];
    }

    // Inicia o tempo inicial total
    const tempoInicialTotal = performance.now();

    while (!(await this.stop(iteracoes, interrompe))) {
      await delay(0);

      /**
       * Atualizar as estatisticas
       */
      this.statistics.avaliacaoPorIteracao.set(
        iteracoes,
        this.bestSolution.avaliacao
      );

      /**
       * Incrementar o contador de iterações
       */
      iteracoes += 1;

      /**
       * Captura o tempo de inicio da iteração
       */
      tempoInicial = performance.now();

      /**********************************************************************************************/
      vizinhanca = await this.generateNeighborhood();
      vizinhanca = await this.evaluateNeighbors(vizinhanca);
      vizinhanca = await this.verifyTabu(vizinhanca);

      vizinhanca = vizinhanca.sort((a, b) => b.avaliacao - a.avaliacao);

      vizinhanca = vizinhanca.filter((vizinho) => !vizinho.isTabu);

      if (
        vizinhanca.length &&
        this.bestSolution.avaliacao < vizinhanca[0].avaliacao
      ) {
        this.bestSolution = vizinhanca[0];
        this.tabuList.add(vizinhanca[0]);
      }

      /**********************************************************************************************/

      /**
       * Captura o tempo final de execução da iteração, como também atualiza o map com as novas informações
       */
      tempoFinal = performance.now();
      this.statistics.tempoPorIteracao.set(
        iteracoes,
        tempoFinal - tempoInicial
      );

      /**
       * Atualiza um contador para ser utilizado como status de alocação
       */
      if (atualizaQuantidadeAlocacoes) {
        atualizaQuantidadeAlocacoes(
          this.bestSolution.atribuicoes.filter(
            (atribuicao) => atribuicao.docentes.length > 0
          ).length
        );
      }
    }

    /**
     * Atualizar a lista com as avaliações por iteração (devido ao while o último ficará de fora da lista)
     */
    this.statistics.avaliacaoPorIteracao.set(
      iteracoes,
      this.bestSolution.avaliacao
    );

    /**
     * Finalizar a atualização das estatisticas
     */
    this.statistics.interrupcao = interrompe && interrompe();
    this.statistics.iteracoes = iteracoes;
    this.statistics.tempoExecucao = tempoInicialTotal;

    return this.bestSolution;
  }
}
