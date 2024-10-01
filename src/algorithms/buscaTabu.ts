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
} from "@/context/Global/utils";
import { atualizarListaTabu, disciplinaInvalida, gerarTrocasDeDocentes, gerarVizinhoComDocente, gerarVizinhoComRemocao, processarAtribuicaoInicial, Solucao } from "./utils";
import { Dispatch, SetStateAction } from "react";

/**
 * Função para avaliar uma solução
 * @param {Atribuicao[]} atribuicoes Atribuições a serem avaliadas.
 * @param {Docente[]} docentes Lista contendo todos os docentes.
 * @param {Disciplina[]} disciplinas Lista contendo todas as disciplinas.
 * @param {number} maiorPrioridade Maior prioridade encontrada nos formulários.
 * @returns {number} Valor avaliado para as atribuições apresentadas.
 */
function avaliarSolucao(
  atribuicoes: Atribuicao[],
  docentes: Docente[],
  disciplinas: Disciplina[],
  maiorPrioridade: number
): number {
  let avaliacao = 0;

  // Tendo em vista que as atribuições são feotas apenas para docentes que apresentem formulários preenchidos.
  for (const atribuicao of atribuicoes) {
    // Mesmo tendo uma trava para apeas um docente alocado por disciplina, o código já foi elaborado para futuramente
    // aceitar o comportamento de mais de um docente alocado.
    for (const docenteAtribuido of atribuicao.docentes) {
      const docente = docentes.find((obj) => obj.nome === docenteAtribuido);
      // Validação para caso o usuário tenha feito uma atribuição em que o docente não tenha um formulário preenchido
      if(docente.formularios.get(atribuicao.id_disciplina)) {
        avaliacao += maiorPrioridade - docente.formularios.get(atribuicao.id_disciplina);
      }// } else {
      //   avaliacao -= 100
      // }
    }
  }

  // Penalizar solução para cada choque de horários encontrados nas atribuições dos docentes
  for(const docente of docentes) {
    // Lista com os Ids das disciplinas
    const atribuicoesDocente: string[] = atribuicoes.filter(atribuicao => atribuicao.docentes.includes(docente.nome)).map(atribuicao => atribuicao.id_disciplina)

    // Comparar as atribuições para ver se a `Disciplia.conflitos` não incluem umas as outras
    for(let i = 0; i < atribuicoesDocente.length; i++) {
      const disciplinaPivo: Disciplina = disciplinas.find(disciplina => disciplina.id === atribuicoesDocente[i]);
      
      for(let j = i + 1; j < atribuicoesDocente.length; j++) {
        const disciplinaAtual: Disciplina = disciplinas.find(disciplina => disciplina.id === atribuicoesDocente[j]) ;

        if(disciplinaPivo.conflitos.has(disciplinaAtual.id)) {
          avaliacao -= 1000
        }
      }
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
  maiorPrioridade: number
): Solucao {
  const novaSolucao: Solucao = {atribuicoes: atribuicoes, avaliacao: 0}
  // const novaSolucao = structuredClone(solucaoBase); // Clonar o objeto -  deep clone - nativo
  // novaSolucao.atribuicoes[indiceAtribuicao].docentes = novosDocentes;

  // Reavaliar a nova solução após a mudança
  novaSolucao.avaliacao = avaliarSolucao(
    novaSolucao.atribuicoes,
    docentes,
    disciplinas,
    maiorPrioridade
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
export function gerarSolucoes(vizinhos: Atribuicao[][], docentes: Docente[], disciplinas: Disciplina[], MaiorPrioridade: number): Solucao[] {
  const solucoesAtuais: Solucao[] = []

  for(const vizinho of vizinhos) {
    const solucaoVizinho = criarNovaSolucao(vizinho, docentes, disciplinas, MaiorPrioridade);
    solucoesAtuais.push(solucaoVizinho)
  }

  return solucoesAtuais.sort((a, b) => b.avaliacao - a.avaliacao) // Ordenar o array (decrescente)
}

// /**
//  * Função responsável por gerar os vizinhos para a busca Tabu
//  * @param {Solucao} solucaoAtual Variável que representa a melhor soçução até o momento.
//  * @param {Docente[]} docentes Lista com todos os docentes.
//  * @param {Disciplina[]} disciplinas  Lista com todas as disciplinas.
//  * @param {Trava[]} travas Litas com as travas existentes para docentes em disciplinas.
//  * @returns {Atribuicao[][]} Uma matriz contendo as vizinhanças geradas.
//  */
// function gerarVizinhos(
//   solucaoAtual: Atribuicao[]/*Solucao*/,
//   docentes: Docente[],
//   disciplinas: Disciplina[],
//   travas: Trava[],
//   listaTabu: Atribuicao[][]
// ): Atribuicao[][]/*Solucao[][]*/ {
//   // Passar por todas as disciplinas e docentes verificando a possibilidade de atribuição.
//   const vizinhanca: Atribuicao[][] = []

//   for(let i = 0; i < disciplinas.length; i++){
//     const disciplinaPivo = disciplinas[i];

//     if(!disciplinaPivo.ativo || travas.some(obj => obj.id_disciplina === disciplinaPivo.id && obj.tipo_trava === TipoTrava.Column)) {
//       continue;
//     }

//     for(const docente of docentes) {
//       if(!docente.ativo) {
//         continue;
//       }

//       if(podeAtribuir(docente, disciplinaPivo, travas)) {
//         const vizinho = structuredClone(solucaoAtual);
//         const atrib = vizinho.find(obj => obj.id_disciplina === disciplinaPivo.id)
//         atrib.docentes = [docente.nome]

//         // Verificar se a vizinhança não está na lista tabu
//         if(!estaNaListaTabu(listaTabu, vizinho)) {
//           vizinhanca.push(vizinho)
//         }
//       }
//     }

    
//     // Verificar a possíbilidade de atribuições vazias.
//     const atribAtual = solucaoAtual.find(obj => obj.id_disciplina === disciplinaPivo.id)
    
//     if(atribAtual.docentes.length > 0) {
//       const vizinho = structuredClone(solucaoAtual);
//       const atrib = vizinho.find(obj => obj.id_disciplina === disciplinaPivo.id)
//       atrib.docentes = []
//         // Verificar se a vizinhança não está na lista tabu
//       if(!estaNaListaTabu(listaTabu, vizinho)) {
//         vizinhanca.push(vizinho)
//       }
//     }
    

//     // Trocar docentes

//     // Buscar o docente atualmente atribuido a disciplina Pivo
//     const atribDocentePivo = solucaoAtual.find(obj => obj.id_disciplina === disciplinaPivo.id)
//     const docentePivot = docentes.find(obj => obj.nome === atribDocentePivo.docentes[0])


//     if(docentePivot && (!docentePivot.ativo || travas.some(obj => obj.nome_docente === docentePivot.nome && obj.tipo_trava === TipoTrava.Row))) {
//       continue;
//     }

//     if(!docentePivot) {
//       continue
//     }

//     if(atribDocentePivo.docentes.length === 0) {
//       continue
//     }

//     // Eu troco A com B depois eu troco B com A. utilizar index partindo de i
//     // Ajustar para mais de um docente atribuido
//     for(let j = i + 1; j < disciplinas.length; j++) {
//       const disciplinaAtual = disciplinas[j]
//       if(disciplinaPivo.id === disciplinaAtual.id) {
//         continue;
//       }

//       if(!disciplinaAtual.ativo 
//         || travas.some(obj => obj.id_disciplina === disciplinaAtual.id && obj.tipo_trava === TipoTrava.Column)
//         || travas.some(obj => obj.id_disciplina === disciplinaAtual.id && obj.nome_docente && obj.nome_docente === docentePivot.nome)) {
//         continue;
//       }

//       const atribDocenteAtual = solucaoAtual.find(obj => obj.id_disciplina === disciplinaAtual.id)
//         if(atribAtual.docentes.length === 0) {
//           continue;
//         }

//       const docenteAtual = docentes.find(obj => obj.nome === atribDocenteAtual.docentes[0])

//       if(!docenteAtual && (!docenteAtual.ativo  || travas.some(obj => obj.id_disciplina === disciplinaAtual.id && obj.nome_docente && obj.nome_docente === docenteAtual.nome))) {
//         continue;
//       }

//        if(!docenteAtual) {
//       continue
//     }

//       // DOcente A pode disciplia B e se DOcente B pode Disciplina A
//       if(podeAtribuir(docentePivot, disciplinaAtual, travas) && podeAtribuir(docenteAtual, disciplinaPivo, travas)) {
//         const vizinho = structuredClone(solucaoAtual);

//         const atrib1 = vizinho.find(obj => obj.id_disciplina === disciplinaPivo.id)
//         const atrib2 = vizinho.find(obj => obj.id_disciplina === disciplinaAtual.id)

//         // Atrib Doc B na Disc A e Atrib Doc A na Disc B
//         atrib1.docentes = [docenteAtual.nome]
//         atrib2.docentes = [docentePivot.nome]

//         // Verificar se não estão no tabu
//         if(!estaNaListaTabu(listaTabu, vizinho)) {
//           vizinhanca.push(vizinho)
//         }
//       }
//     }
//   }

//   return vizinhanca
// }

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

  /*for (const disciplina of disciplinas)*/ 
  for(let i = 0; i < disciplinas.length; i++) {
    const disciplina = disciplinas[i];
    if (disciplinaInvalida(disciplina, travas)) continue;

    // Gera vizinhos com docentes
    // vizinhanca = vizinhanca.concat(
    //   gerarVizinhoComDocente(solucaoAtual, docentes, disciplina, travas, listaTabu)
    // );

    const vizinhancaDocentes = gerarVizinhoComDocente(solucaoAtual, docentes, disciplina, travas, listaTabu)
    if(vizinhancaDocentes.length > 0) {
      vizinhanca = vizinhanca.concat(vizinhancaDocentes)
    }

    // Gera vizinho com remoção de docentes
    // vizinhanca = vizinhanca.concat(
    //   gerarVizinhoComRemocao(solucaoAtual, disciplina, listaTabu)
    // );
    const vizinhancaRemover = gerarVizinhoComRemocao(solucaoAtual, disciplina, listaTabu)
    if(vizinhancaRemover.length > 0) {
      vizinhanca = vizinhanca.concat(vizinhancaRemover)
    }

    // Gera vizinhos trocando docentes entre disciplinas
    // vizinhanca = vizinhanca.concat(
    //   gerarTrocasDeDocentes(solucaoAtual, disciplina, i, disciplinas, docentes, travas, listaTabu)
    // );
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
export async function buscaTabuRefactor(
  disciplinas: Disciplina[],
  docentes: Docente[],
  formularios: Formulario[],
  travas: Trava[],
  atribuicoes: Atribuicao[],
  NumIterNotChange: number, /*Constante vinda da chamada*/
  MaiorPrioridade: number, /*Constante vinda da chamada*/
  interrompe: () => boolean,
  //setIteracoes: Dispatch<SetStateAction<number>>
): Promise<Solucao> {
  // Inicializa a lista tabu
  const listaTabu: Atribuicao[][] = [];

  // Variável para controlar a quantidade de iterações sem modifiação
  let iteracoesSemModificacao = 0
  
  // Solução inicial inclui as atribuições fornecidas pelo usuário
  let solucaoAtual: Solucao = {
    atribuicoes: processarAtribuicaoInicial(structuredClone(atribuicoes), docentes, disciplinas, travas),
    avaliacao: avaliarSolucao(
      atribuicoes,
      docentes,
      disciplinas,
      MaiorPrioridade
    ),
  };

  let melhorSolucao: Solucao = solucaoAtual;

  // Criar uma função que faça toda a validação do while
  while(true) {
    await delay(0);
    // Gerar vizinhos e selecionar o melhor não tabu
    const vizinhos: Atribuicao[][] = gerarVizinhos(solucaoAtual.atribuicoes, docentes, disciplinas, travas, listaTabu);

    // Selecionar o vizinho com a maior avaliação
    const melhorVizinho: Solucao = gerarSolucoes(vizinhos, docentes, disciplinas, MaiorPrioridade)[0];

    // Verifica se o melhor vizinho existe
    if(melhorVizinho) {
      // Atualizar a lista tabu com o conjunto de atribuições do melhor vizinho
      atualizarListaTabu(listaTabu, melhorVizinho.atribuicoes);

      // Atualizar a solução atual e a melhor solução
      solucaoAtual = melhorVizinho;
      if (solucaoAtual.avaliacao > melhorSolucao.avaliacao) {
        melhorSolucao = solucaoAtual;
        iteracoesSemModificacao = 0; // Reseta as iterações sem modificação
      } else {
        iteracoesSemModificacao++;  // Acrescenta mais um em iteração sem modificação
      }
    } else {
      iteracoesSemModificacao++;  // Acrescenta mais um em iteração sem modificação
    }

    if(iteracoesSemModificacao === NumIterNotChange || interrompe()) {
      break;
    }
  }

  return melhorSolucao;
}




