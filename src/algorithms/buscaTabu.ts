/**
 * Busca Tabu
 * Essa função será a principal, agrupando as chamadas para as demais funções.
 * O encerramento do algoritmo deverá ser dado nesta função, com as seguintes condições:
 *      - Caso todas as disciplinas, que algum docente tiver preenchido o formulário, estiverem alocadas
 *          e o número de iterações sem melhoras na avaliação seja igual a `NumIterNotChange`;
 *      - Ou se o usuário interromper a execução do algoritmo.
 *
 * Inicialmente a função irá gerar uma primeira solução, antes de entrar no loop,
 * com as atribuições feitas previamente pelo usuário para ser atribuída como `melhorSolucao`.
 *
 * A `listaTabu` será iniciada com as atribuições previamente feitas pelo usuário, ou, caso não existam, iniciará vazia.
 * Vale ressaltar que a `listaTabu` deve armazenar as últimas `SizeTabuList` iterações/vizinhanças geradas,
 * podendo ser uma matriz bidimensional.
 *
 * Deve ser acrescentado +1 em `iteracoes` para cada iteração do while.
 *
 * A função `gerarVizinhos` deve ser chamada, tendo em vista que as soluções geradas não podem estar presentes na `listaTabu` e
 * cada tentativa de alocação/alteração na vizinhança deverá ser validada pela função `podeAtribuir`.
 * Vale ressaltar que os "movimentos" permitidos para uma nova atribuição são:
 *      - Adicionar um docente
 *          ** Caso a atribuição ainda não apresentar nenhum;
 *      - Trocar o docente alocado por outro;
 *      - Remover o docente alocado
 *          ** Caso a troca não seja válida.
 * A função `gerarVizinhos` retornará um objeto da interface `Solucao`,apresentando as alocações realizadas e uma avaliação
 * para a solução.
 *
 * A função `podeAtribuir` deverá verificar se será possível atribuir o docente a disciplina, levando em conta as seguintes regras:
 *      - O docente e a disciplina devem estar ativos;
 *      - O docente não deve estar na lista de `travas` da disciplina;
 *      - A atribuição não pode estar na `listaTabu`;
 *          ** Essa verificação é feita pela função `estaNaListaTabu` a qual recebe como parâmetros a `listaTabu` e a atribuição.
 *      - O docente só pode ser atribuído a uma disciplina que ele tenha preenchido o formulário;
 *      - O docente não pode ser atribuído a disciplina se apresentar choque de horário com outra que ele tenha sido alocado.
 *          ** A interface disciplina apresenta a propriedade conflitos, a qual previamente foi gerada. Essa propriedade apresenta
 *              todas as disciplinas que tenham choque de horário com a "atual".
 *      - O docente só pode ser atribuído se a disciplina não houver outro docente atribuído.
 *          ** Nesses casos serão aceitas somente trocas.
 *            *** Verificar se faz sentido essa verificação nesta função ***
 *
 * A avaliação será gerada dentro da função `gerarVizinhos` por uma outra função chamada `avaliarSolucao`.
 * Essa função atribuirá pontos a solução enviada como parâmetro segundo as seguintes regras:
 *      - Aumentar a pontuação se os docentes foram atribuídos de acordo com as prioridades do formulário
 *          * O aumento será baseado no valor (`MaiorPrioridade` - valor da prioridade do docente),
 *              bonificando as soluções com as "maiores prioridades".
 *
 * Após o retorno da função `gerarVizinhos`, a nova vizinhança será adicionada na `listaTabu` pela função `atualizarListaTabu`,
 * a qual insere a nova solução e verifica se a `listaTabu` está maior que `SizeTabuList`.
 * Caso esteja maior, o primeiro item será removido.
 *
 * O último passo será verificar se a nova vizinhança apresenta a avaliação melhor que `melhorSolucao`.
 * Se sim, `melhorSolucao` deve receber a nova vizinhança, caso contrário nada deve ser feito.
 *
 * A função `buscaTabu` deve retornar a interface `Solucao`.
 */

import {
  Celula as Trava,
  Disciplina,
  Docente,
  Atribuicao,
  Formulario,
  Solucao,
  Parametros
} from "@/context/Global/utils";
import { atualizarListaTabu, checaTravaCelula, disciplinaInvalida, gerarTrocasDeDocentes, gerarVizinhoComDocente, gerarVizinhoComRemocao } from "./utils";
import { Dispatch, SetStateAction } from "react";

/**
 * Função para avaliar uma solução
 * @param {Atribuicao[]} atribuicoes Atribuições a serem avaliadas.
 * @param {Docente[]} docentes Lista contendo todos os docentes.
 * @param {Disciplina[]} disciplinas Lista contendo todas as disciplinas.
 * @param {number} maiorPrioridade Maior prioridade encontrada nos formulários.
 * @returns {number} Valor avaliado para as atribuições apresentadas.
 */
export function avaliarSolucao(
  atribuicoes: Atribuicao[],
  docentes: Docente[],
  disciplinas: Disciplina[],
  maiorPrioridade: number,
  parametros: Parametros
): number {
  let avaliacao = 0;

  parametros.k1; // @@

  parametros.k1; // @@

  console.log( atribuicoes );

  // Percorre as disciplinas:
  for (const atribuicao of atribuicoes) {
    
    // Penaliza disciplina não atribuída:
    if ( atribuicao.docentes.length == 0 ) {
      avaliacao -= parametros.k4;
      continue;
    }

    // Percorre todos os docentes atribuídos:
    for ( const docenteAtribuido of atribuicao.docentes ) {
      const docente = docentes.find( (obj) => obj.nome === docenteAtribuido );

      if( docente.formularios.get( atribuicao.id_disciplina ) ) {
        // k1 penaliza prioridades
        avaliacao += parametros.k1 * ( maiorPrioridade - docente.formularios.get(atribuicao.id_disciplina) );
      }
      else // Docente não escolheu a disciplina (pode ocorrer em atribuição manual)
      {
        avaliacao -= parametros.k1;
      }
    }
  }


  // Penalizar solução para cada choque de horários encontrados nas atribuições dos docentes
  for( const docente of docentes ) {
    // Lista com os Ids das disciplinas
    const atribuicoesDocente: string[] = atribuicoes.filter(atribuicao => atribuicao.docentes.includes(docente.nome)).map(atribuicao => atribuicao.id_disciplina)

    // Comparar as atribuições para ver se a `Disciplia.conflitos` não incluem umas as outras
    for(let i = 0; i < atribuicoesDocente.length; i++) {
      const disciplinaPivo: Disciplina = disciplinas.find(disciplina => disciplina.id === atribuicoesDocente[i]);
      
      for(let j = i + 1; j < atribuicoesDocente.length; j++) {
        const disciplinaAtual: Disciplina = disciplinas.find(disciplina => disciplina.id === atribuicoesDocente[j]) ;

        if(disciplinaPivo.conflitos.has(disciplinaAtual.id)) {
          // k2 penaliza conflitos
          avaliacao -= parametros.k2;
        }
      }
    }
  }

  // Aqui estamos penalizando o número de disciplinas, mas
  // devemos penalizar o número de créditos. Esta informação
  // deverá constar em dados para próximas versões.

  // Conta número de disciplinas por docente:
  const tmpDocentes = {};
  for ( const docente of docentes ) {
    tmpDocentes[ docente.nome ] = 0;
  }
  for ( const atribuicao of atribuicoes ) {
    for ( const docName of atribuicao.docentes ) {
      tmpDocentes[ docName ] += 1;
    }
  }
  // Penaliza baseado no saldo:
  for ( const docente of docentes ) {
    if ( tmpDocentes[ docente.nome ] > 2 ) {
      avaliacao -= parametros.k5 * ( docente.saldo < -1.0 ? 0.75 : 1.0 );
    }
    else if ( tmpDocentes[ docente.nome ] < 1 ) {
      avaliacao -= parametros.k5 * ( docente.saldo > 1.0 ? 1.0 : 0.75 );
    }
  }

  return avaliacao;
}

/**
 * Função auxiliar que tem como objetivo gerar um objeto `Solucao`.
 * @param {Atribuicao[]} atribuicoes Atribuições a serem avaliadas.
 * @param {Docente[]} docentes Lista contendo todos os docentes.
 * @param {Disciplina[]} disciplinas Lista contendo todas as disciplinas.
 * @param {number} maiorPrioridade Maior prioridade encontrada nos formulários.
 * @returns {Solucao} Objeto contendo as atribuições e a avaliação referente a ela. 
 */
function criarNovaSolucao(
  atribuicoes: Atribuicao[],
  docentes: Docente[],
  disciplinas: Disciplina[],
  maiorPrioridade: number,
  parametros: Parametros
): Solucao {
  const novaSolucao: Solucao = {atribuicoes: atribuicoes, avaliacao: 0}
  // Reavaliar a nova solução após a mudança
  novaSolucao.avaliacao = avaliarSolucao(
    novaSolucao.atribuicoes,
    docentes,
    disciplinas,
    maiorPrioridade,
    parametros
  );

  return novaSolucao;
}

/**
 * Função que tem como objetivo gerar as soluções para todos os vizinhos.
 * @param {Atribuicao[][]} vizinhos Conjunto contendo todos os vizinhos gerados. 
 * @param {Docente[]} docentes Lista contendo todos os docentes.
 * @param {Disciplina[]} disciplinas Lista contendo todas as disciplinas.
 * @param {number} maiorPrioridade Maior prioridade encontrada nos formulários.
 * @returns {Solucao} Uma lista com todas as soluções para cada conjunto de vizinhos, em ordem decrescente.
 */
export function gerarSolucoes(vizinhos: Atribuicao[][], docentes: Docente[], disciplinas: Disciplina[], MaiorPrioridade: number, parametros: Parametros): Solucao[] {
  const solucoesAtuais: Solucao[] = []

  for(const vizinho of vizinhos) {
    const solucaoVizinho = criarNovaSolucao(vizinho, docentes, disciplinas, MaiorPrioridade, parametros);
    solucoesAtuais.push(solucaoVizinho)
  }

  return solucoesAtuais.sort((a, b) => b.avaliacao - a.avaliacao) // Ordenar o array (decrescente)
}

/**
 * Função responsável por gerar os vizinhos para a busca Tabu.
 * @param {Atribuicao[]} solucaoAtual A solução atual com as atribuições feitas até o momento.
 * @param {Docente[]} docentes Lista com todos os docentes.
 * @param {Disciplina[]} disciplinas Lista com todas as disciplinas.
 * @param {Trava[]} travas Lista com as travas existentes para docentes em disciplinas.
 * @param {Atribuicao[][]} listaTabu A lista tabu contendo as soluções já geradas.
 * @returns {Atribuicao[][]} Uma matriz contendo as vizinhanças geradas.
 */
function gerarVizinhos(
  solucaoAtual: Atribuicao[],
  docentes: Docente[],
  disciplinas: Disciplina[],
  travas: Trava[],
  listaTabu: Atribuicao[][]
): Atribuicao[][] {
  let vizinhanca: Atribuicao[][] = [];

  for(let i = 0; i < disciplinas.length; i++) {
    const disciplina = disciplinas[i];
    if (disciplinaInvalida(disciplina, travas)) continue;
  
    const atribuicao = solucaoAtual.find(obj => obj.id_disciplina === disciplina.id);
    if(atribuicao.docentes.some(nome => checaTravaCelula(nome, disciplina.id, travas))){
      continue;
    }

    // Gera vizinhos com docentes
    const vizinhancaDocentes = gerarVizinhoComDocente(solucaoAtual, docentes, disciplina, travas, listaTabu)
    if(vizinhancaDocentes.length > 0) {
      vizinhanca = vizinhanca.concat(vizinhancaDocentes)
    }

    // Gera vizinho com remoção de docentes
    const vizinhancaRemover = gerarVizinhoComRemocao(solucaoAtual, disciplina, listaTabu)
    if(vizinhancaRemover.length > 0) {
      vizinhanca = vizinhanca.concat(vizinhancaRemover)
    }

    // Gera vizinhos trocando docentes entre disciplinas
    const vizinhancaTroca = gerarTrocasDeDocentes(solucaoAtual, disciplina, i, disciplinas, docentes, travas, listaTabu);
    if(vizinhancaTroca.length > 0) {
      vizinhanca = vizinhanca.concat(vizinhancaTroca)
    }
  }

  return vizinhanca;
}

/**
 * Função utilizada para aplciar uma pausa no processo.
 * @param {number} ms Valor em milissegundos.
 */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Algoritmo de Busca Tabu
export async function buscaTabu(
  disciplinas: Disciplina[],
  docentes: Docente[],
  formularios: Formulario[],
  travas: Trava[],
  atribuicoes: Atribuicao[],
  NumIterNotChange: number, /*Constante vinda da chamada*/
  MaiorPrioridade: number, /*Constante vinda da chamada*/
  interrompe: () => boolean,
  setDisciplinasAlocadas: Dispatch<SetStateAction<number>>,
  parametros: Parametros
): Promise<Solucao> {
  /**
   * Variáveis para as estatísticas
   */

  let iteracoes = 0;
  const avaliacaoPorIteracao: Map<number, number> = new Map<number, number>();
  const tempoPorIteracao: Map<number, number> = new Map<number, number>();
  let tempoInicial: number; // Por iteração
  let tempoFinal: number; // Por iteração
  /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/

  // Inicializa a lista tabu
  const listaTabu: Atribuicao[][] = [];

  // Variável para controlar a quantidade de iterações sem modifiação
  // let iteracoesSemModificacao = 0
  
  // Solução inicial inclui as atribuições fornecidas pelo usuário
  let solucaoAtual: Solucao = {
    atribuicoes: atribuicoes,
    avaliacao: avaliarSolucao(
      atribuicoes, // Verificar se aqui não seria melhor já passar as atribuições processadas
      docentes,
      disciplinas,
      MaiorPrioridade,
      parametros
    ),
  };

  // Adição da avaliação das atribuições de entrada do algoritmo
  //avaliacaoPorIteracao.set(iteracoes, solucaoAtual.avaliacao)

  let melhorSolucao: Solucao = solucaoAtual;

  // Inicia o tempo inicial total
  const tempoInicialTotal = performance.now();

  // Criar uma função que faça toda a validação do while
  while(true) {
    await delay(1);
    // Tempo de início da iteração
    tempoInicial = performance.now()
    iteracoes += 1;
    avaliacaoPorIteracao.set(iteracoes, melhorSolucao.avaliacao)

    // Gerar vizinhos e selecionar o melhor não tabu
    const vizinhos: Atribuicao[][] = gerarVizinhos(solucaoAtual.atribuicoes, docentes, disciplinas, travas, listaTabu);

    // Selecionar o vizinho com a maior avaliação
    const melhorVizinho: Solucao = gerarSolucoes(vizinhos, docentes, disciplinas, MaiorPrioridade, parametros)[0];

    // Verifica se o melhor vizinho existe
    if(melhorVizinho) {
      // Atualizar a lista tabu com o conjunto de atribuições do melhor vizinho
      atualizarListaTabu(listaTabu, melhorVizinho.atribuicoes, parametros.k3);

      // Atualizar a solução atual e a melhor solução
      solucaoAtual = melhorVizinho;
      if (solucaoAtual.avaliacao >= melhorSolucao.avaliacao) {
        // Atualiza a maior quantidade de disciplinas alocadas
        if(solucaoAtual.atribuicoes.filter(obj => obj.docentes.length !== 0).length >= melhorSolucao.atribuicoes.filter(obj => obj.docentes.length !== 0).length) {
          setDisciplinasAlocadas(solucaoAtual.atribuicoes.filter(obj => obj.docentes.length !== 0).length)
        }
        melhorSolucao = solucaoAtual;
        
        // iteracoesSemModificacao = 0; // Reseta as iterações sem modificação
      } 
      // else {
      //   iteracoesSemModificacao++;  // Acrescenta mais um em iteração sem modificação
      // }
    } 
    // else {
    //   iteracoesSemModificacao++;  // Acrescenta mais um em iteração sem modificação
    // }

    // Tempo final da iteração
    tempoFinal = performance.now()
    tempoPorIteracao.set(iteracoes, tempoFinal - tempoInicial)


    if(/*iteracoesSemModificacao === NumIterNotChange ||*/ interrompe() || !existeDisciplinasQueAindaPodemSerAtribuidas(melhorSolucao, docentes)) {
      break;
    }
  }

  // Tempo final, sendo o tempo inicial fora do loop e o último tempo medido.
  const tempoTotal = tempoFinal - tempoInicialTotal;

  
  return {...melhorSolucao, estatisticas: {
    avaliacaoPorIteracao: avaliacaoPorIteracao,
    interrupcao: interrompe(),
    iteracoes: iteracoes,
    tempoExecucao: tempoTotal,
    tempoPorIteracao: tempoPorIteracao
  }};
}

function existeDisciplinasQueAindaPodemSerAtribuidas(solucao: Solucao, docentes: Docente[]) {
  const atribuicoesSemDocentes = solucao.atribuicoes.filter(atrib => atrib.docentes.length === 0)

  //Não existem disciplinas sem docentes alocados
  if(atribuicoesSemDocentes.length === 0) {
    return false
  }

  //let contadorDePossiveisAtribuicoes = 0
  //Algum docente tem um formulário para as disciplinas não atribuídas ?
  atribuicoesSemDocentes.map(obj => {
    for(const docente of docentes) {
      if(docente.formularios.has(obj.id_disciplina)) {
        //contadorDePossiveisAtribuicoes++;
        return true
      }
    }
  })
 
  //Não existem mais possibilidades de atribuições para as disciplinas sem docentes
  // if(contadorDePossiveisAtribuicoes === 0) {
  //   return false
  // }

  //Ainda existe possibilidade
  return true
}

