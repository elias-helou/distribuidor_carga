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
import {
  Solucao,
} from "./utils";
import { Dispatch, SetStateAction } from "react";

// Função para checar se um docente pode ser alocado a uma disciplina (incluindo atribuições do usuário)
function podeAtribuir(
  docente: Docente,
  disciplina: Disciplina,
  travas: Trava[],
  atribuicoes: Atribuicao[],
  disciplinas: Disciplina[],
): boolean {
  if (!disciplina.ativo || !docente.ativo) {
    return false;
  }

  if (travas.some(trava => trava.id_disciplina === disciplina.id && trava.nome_docente === docente.nome)) {
    return false;
  }

  // Pensar se eu devo verificar aqui se está na lista tabu

  // Verifica se o docente apresenta um formulário para a disciplina
  if (!docente.formularios.has(disciplina.id)) {
    return false;
  }

  // Verifica se o docente não foi alocado em outra disciplina que apresente choque de horário
  const docenteAtribuicoes: string[] = atribuicoes.filter(atribuicao => atribuicao.docentes.includes(docente.nome))
                                                    .map(atribuicao => atribuicao.id_disciplina)
  if(disciplinas.some(disc => docenteAtribuicoes.includes(disc.id) && disc.conflitos.has(disciplina.id))) {
    return false;
  }

  // A disciplina não pode apresentar mais de um docente
  const discAtribuicao: Atribuicao = atribuicoes.find(atribuicao => atribuicao.id_disciplina === disciplina.id)
  if(discAtribuicao.docentes.length === 1) {
    return false
  }

  return true;
}

// Função para avaliar uma solução
function avaliarSolucao(
  atribuicoes: Atribuicao[],
  docentes: Docente[],
  maiorPrioridade: number
): number {
  let avaliacao = 0;

  // Tendo em vista que as atribuições são feotas apenas para docentes que apresentem formulários preenchidos.
  for(const atribuicao of atribuicoes) {
    // Mesmo tendo uma trava para apeas um docente alocado por disciplina, o código já foi elaborado para futuramente
    // aceitar o comportamento de mais de um docente alocado.
    for(const docenteAtribuido of atribuicao.docentes) {
      const doc = docentes.find(obj => obj.nome === docenteAtribuido);
      avaliacao += maiorPrioridade - doc.formularios.get(atribuicao.id_disciplina)
    }
  }

  return avaliacao;
}


// Função auxiliar para gerar uma nova solução baseada em uma mudança de docentes
function criarNovaSolucao(
  solucaoBase: Solucao,
  indiceAtribuicao: number,
  novosDocentes: string[],
  formularios: Formulario[],
  docentes: Docente[],
  disciplinas: Disciplina[],
  maiorPrioridade: number
): Solucao {

}

// Função para gerar vizinhos (movimentos)
function gerarVizinhos(
  solucao: Solucao,
  docentes: Docente[],
  disciplinas: Disciplina[],
  travas: Trava[],
  formularios: Formulario[],
  maiorPrioridade: number
): Solucao[] {

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
  maxIteracoes: number,
  maiorPrioridade: number,
  interrompe: () => boolean,
  setIteracoes: Dispatch<SetStateAction<number>>
): Promise<Solucao> {


}


