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
import { StopCriteria } from "./Abstract/StopCriteria";
import { AspirationCriteria } from "./Abstract/AspirationCriteria";

export class TabuSearch {
  /**
   * Lista tabu com a sua tipagem dinâmica devido a possibilidades de diferentes interpretações.
   */
  public tabuList: TabuList<any>;

  /**
   * Solução final após a execução do algoritmo ou a melhor solução encontrada até o momento.
   * O valor é `undefined` até o algoritmo ser executado ou salvo no histórico (solução manual).
   */
  public bestSolution: Vizinho | undefined;

  // Informações base para os processos
  protected context: Context;

  // Processos de geração de vizinhos
  public neighborhoodPipe: Map<string, NeighborhoodFunction> = new Map<
    string,
    NeighborhoodFunction
  >();

  /**
   * Parâmetros refentes as penalizações, contudo, a classe Constraint apresenta Constraint.penalty
   */
  public parameters: Parametros;

  // Restrições
  public constraints: {
    hard: Map<string, Constraint>;
    soft: Map<string, Constraint>;
  };

  /**
   * Estatísticas referentes a execução do algoritmo
   */
  public statistics: Statistics;

  /**
   * Lista que armazena os processos que serão responsáveis por interromper a execução
   * do algoritmo.
   */
  public stopPipe: Map<string, StopCriteria> = new Map<string, StopCriteria>();

  /**
   * Lista que armazena os critérios de aspiração que serão aplicados durante a execução
   * do algoritmo.
   */
  public aspirationPipe: Map<string, AspirationCriteria> = new Map<
    string,
    AspirationCriteria
  >();

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
    stopFunctions: StopCriteria[],
    aspirationFunctions: AspirationCriteria[],
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
      docentesPrioridade: new Map<number, number>(),
      qtdOcorrenciasRestricoes: new Map<
        string,
        { label: string; qtd: number }[]
      >(),
    };

    /**
     * Inicializa a propriedade `stopCriteria`
     */
    for (const func of stopFunctions) {
      this.stopPipe.set(func.name, func);
    }

    /**
     * Inicializa os critérios de aspiração
     */
    for (const func of aspirationFunctions) {
      this.aspirationPipe.set(func.name, func);
    }
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
  stop(
    iteracoes: number,
    melhorVizinhoGerado: Vizinho,
    interrompe?: () => boolean
  ): boolean {
    if (interrompe && interrompe()) return true;

    for (const process of this.stopPipe.values()) {
      if (process.stop(iteracoes, this.bestSolution, melhorVizinhoGerado)) {
        return true;
      }
    }
    //return iteracoes === 200 || (interrompe && interrompe());
    return false;
  }

  /**
   * Esse método tem como objetivo encontrar, e atualizar, o melhor vizinho entre os elementos
   * da vizinhança gerada e a melhor solução encontrada até o momento.
   * O método aplicará o `Pipeline` referente aos critéios de aspiração, dessa forma, caso uma nova melhor
   * solução seja encontrada pelas aspirações, o elemento deve ser removido da lista tabu para ser
   * adicionado novamente pelo loop principal do algoritmo.
   * @param vizinhanca Vizinhança gerada pelo método `generateNeighborhood`.
   * @returns Retorna o melhor vizinho e o indice na vizinhança.
   */
  async findBestSolution(vizinhanca: Vizinho[]): Promise<{
    vizinho: Vizinho;
    index: number | undefined;
  }> {
    /**
     * O processo de avaliação deve continuar até o momento em que os elementos da vizinhança
     * apresentem a avaliação menor que a melhor até o momento. Percorrer toda a lista gastaria
     * muito tempo de execução e não traria nenhum efeito positivo, apenas lentidão.
     */
    for (let i = 0; i < vizinhanca.length; i++) {
      if (vizinhanca[i].avaliacao < this.bestSolution.avaliacao) {
        break;
      }

      /**
       * Se o vizinho for tabu, os critérios de asporação devem ser validados.
       */
      if (vizinhanca[i].isTabu) {
        let fulfills = false;
        for (const aspiration of this.aspirationPipe.values()) {
          fulfills =
            fulfills || aspiration.fulfills(vizinhanca[i], this.bestSolution);
        }

        /**
         * Se o vizinho cumprir pelo menos um critério, a melhor solução encontrada deve
         * ser atualizada e removida da lista tabu.
         */
        if (fulfills) {
          // this.tabuList.remove(this.tabuList.indexOf(vizinhanca[i]));
          // this.bestSolution = vizinhanca[i];
          return { vizinho: vizinhanca[i], index: i };

          // /**
          //  * Como a vizinhança é ordenada de forma decrescente, caso encontremos uma solução com maior
          //  * avaliação, o processo pode ser interrompido.
          //  */
          // break;
        }
      } else {
        /**
         * Aqui temos a garantia de que o vizinho tem a avaliação `maior ou igual` a melhor encontrada,
         * como também que ele não é tabu.
         */
        return { vizinho: vizinhanca[i], index: i };
        // this.bestSolution = vizinhanca[i];
        // break;
      }
    }
    return { vizinho: this.bestSolution, index: undefined };
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
    let vizinhanca: Vizinho[] = [];
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

    /**
     * Inicializa o primeiro item da lista de tempo por iteração com 0
     */
    this.statistics.tempoPorIteracao.set(iteracoes, 0);
    // Inicia o tempo inicial total
    const tempoInicialTotal = performance.now();

    while (!this.stop(iteracoes, vizinhanca[0], interrompe)) {
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

      /**
       * Processo de encontrar o melhor vizinho.
       */
      const localBestSolution = await this.findBestSolution(vizinhanca);

      /**
       * Verifica se a propriedade `index` está definida, representando uma nova solução encontrada.
       */
      if (localBestSolution.index !== undefined) {
        /**
         * Verifica se a nova solução encontrada é tabu. Se for, implica-se que algum critério
         * de aspiração foi atendido.
         * A solução deve ser rmeovida da lista tabu, melhor solução global atualizada e inserida
         * novamente na lista tabu.
         *
         * Caso contrário, a solução encontrada não é tabu e deve-se apenas ser atualizado o melhor
         * vizinho e inseri-lo na lista tabu.
         */
        if (localBestSolution.vizinho.isTabu) {
          this.tabuList.remove(
            this.tabuList.indexOf(localBestSolution.vizinho)
          );
          localBestSolution.vizinho.isTabu = false;
        }

        if (
          this.bestSolution.avaliacao === localBestSolution.vizinho.avaliacao
        ) {
          console.log("Mesmas avaliações");
        }
        this.bestSolution = localBestSolution.vizinho;
        this.tabuList.add(localBestSolution.vizinho);
      }

      // //vizinhanca = vizinhanca.filter((vizinho) => !vizinho.isTabu);

      // if (
      //   vizinhanca.length &&
      //   this.bestSolution.avaliacao <= vizinhanca[0].avaliacao
      // ) {
      //   this.bestSolution = vizinhanca[0];
      //   this.tabuList.add(vizinhanca[0]);
      // }

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
     * Finalizar a atualização das estatísticas
     */
    this.statistics.interrupcao = interrompe && interrompe();
    this.statistics.iteracoes = iteracoes;
    this.statistics.tempoExecucao = tempoInicialTotal;

    this.generateStatistics();

    return this.bestSolution;
  }

  /**
   * Metódo responsável por gerar as estatísticas extras presentes na classe {@link Statistics}
   * @returns {Statistics} Retorna todas as estatísticas geradas.
   */
  generateStatistics(): Statistics {
    /**
     * Gerar os valores referentes a quantidade de atribuições por prioridade.
     * O processo tem início com o preenchimento de toda a lista com zeros.
     */
    for (let i = 0; i < this.context.maiorPrioridade; i++) {
      this.statistics.docentesPrioridade.set(i, 0);
    }

    /**
     * Caso o docente atribuído não tenha um formulário preenchido, o valor '0' representará esses casos.
     */
    for (const atribuicao of this.bestSolution.atribuicoes) {
      for (const _docente of atribuicao.docentes) {
        const docente = this.context.docentes.find(
          (doc) => doc.nome === _docente
        );

        if (docente.formularios.has(atribuicao.id_disciplina)) {
          const prioridade = docente.formularios.get(atribuicao.id_disciplina);
          const qtd = this.statistics.docentesPrioridade.get(prioridade);
          this.statistics.docentesPrioridade.set(prioridade, qtd + 1);
        } else {
          const qtd = this.statistics.docentesPrioridade.get(0);
          this.statistics.docentesPrioridade.set(0, qtd + 1);
        }
      }
    }

    /**
     * Preenche as estatísticas referentes a quantidade de ocorrências das quebras das restrições.
     */

    for (const constraint of this.constraints.hard.values()) {
      this.statistics.qtdOcorrenciasRestricoes.set(
        constraint.name,
        constraint.occurrences(
          this.bestSolution.atribuicoes,
          this.context.docentes,
          this.context.turmas,
          this.context.travas
        )
      );
    }
    for (const constraint of this.constraints.soft.values()) {
      this.statistics.qtdOcorrenciasRestricoes.set(
        constraint.name,
        constraint.occurrences(
          this.bestSolution.atribuicoes,
          this.context.docentes,
          this.context.turmas,
          this.context.travas
        )
      );
    }
    return this.statistics;
  }
}
