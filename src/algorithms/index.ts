import {
  Celula as Trava,
  Disciplina,
  Docente,
  Atribuicao,
  Formulario,
  isHorario,
  horariosSobrepoem,
} from "@/context/Global/utils";
import {
  atualizarListaTabu,
  estaNaListaTabu,
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
  formularios: Formulario[]
): boolean {
  // Verificar se o docente e a disciplina estão ativos
  if (!docente.ativo || !disciplina.ativo) return false; // Remover essa linha pois a função recebe apenas os dados ativos.

  // Verificar se o docente está na lista de travas para a disciplina
  for (const trava of travas) {
    if (
      trava.id_disciplina === disciplina.id &&
      trava.nome_docente === docente.nome
    ) {
      return false; // Docente está travado para essa disciplina
    }
  }

  /** Um docente só pode ser atribuído a uma disciplina em que ele preencheu o formulário */
  const docenteFormularioDisc: Formulario[] = formularios.filter(formulario => formulario.nome_docente === docente.nome && formulario.id_disciplina === disciplina.id)
  if(docenteFormularioDisc.length === 0) {
    return false
  }

  const docenteDisciplinasAtribuidas: string[] = atribuicoes
    .filter((atribuicao) => atribuicao.docentes.includes(docente.nome))
    .map((atribuicao) => atribuicao.id_disciplina);

  const docenteDisciplinas: Disciplina[] = disciplinas.filter((disciplina) =>
    docenteDisciplinasAtribuidas.includes(disciplina.id)
  );

  // Verificar se o docente já foi atribuído a alguma disciplina no mesmo horário
  for (const docenteDisciplina of docenteDisciplinas) {
    for (const horarioDisciplina of docenteDisciplina.horarios) {
      for (const horarioAtual of disciplina.horarios) {
        // Verifica se os dois são da interface horário e também verifica se eles se sobrepoem
        if (
          isHorario(horarioAtual) &&
          isHorario(horarioDisciplina) &&
          horariosSobrepoem(horarioAtual, horarioDisciplina)
        ) {
          return false; // Horários sobrepostos
        }
      }
    }
  }

  return true; // Docente pode ser atribuído
}

// Função para avaliar uma solução
function avaliarSolucao(
  atribuicoes: Atribuicao[],
  formularios: Formulario[],
  docentes: Docente[],
  disciplinas: Disciplina[],
  maiorPrioridade: number
): number {
  let avaliacao = 0;

  // Aumentar a pontuação se os docentes foram atribuídos de acordo com as prioridades do formulário
  // O aumento será baseado no valor da maior prioridade - valor da prioridade do docente, punindo menos as soluções com as "maiores prioridades"
  // Caso um docente seja atribuído sem prioridade definida, será aplicada uma penalidade de  maior prioridade + 1
  for (const atribuicao of atribuicoes) {
    const atribuicaoFormulariosDocentes = formularios
      .filter(
        (formulario) => formulario.id_disciplina == atribuicao.id_disciplina
      )
      .map((a) => a.nome_docente);
    let docenteInFormularios: string = null;

    // Verifica se o docente apresenta um formulário para a disciplina.
    for (const docente of atribuicao.docentes) {
      if (atribuicaoFormulariosDocentes.includes(docente)) {
        docenteInFormularios = docente;
        break;
      }
    }

    // Docente não apresenta formulário /** Remover pois está sendo tratado como restrição */
    if (docenteInFormularios) {
      const formulario = formularios.find(
        (formulario) =>
          formulario.nome_docente == docenteInFormularios &&
          formulario.id_disciplina == atribuicao.id_disciplina
      );
      avaliacao += maiorPrioridade - formulario.prioridade;
    } 
    // else {
    //   //avaliacao -= maiorPrioridade; // Docente atrubuído sem prioridade definida
    // }
  }

  // Penalizar por disciplinas sem professor ou com mais de um professor
  // for (const atribuicao of atribuicoes) {
  //   if (atribuicao.docentes.length == 0 || atribuicao.docentes.length > 1) {
  //     avaliacao -= 10 + atribuicao.docentes.length * 10; // Penalidade por disciplina sem professor
  //   }
  // }

  return avaliacao;
}

// // Função para gerar vizinhos (movimentos)
// function gerarVizinhos(
//   solucao: Solucao,
//   docentes: Docente[],
//   disciplinas: Disciplina[],
//   travas: Trava[],
//   formularios: Formulario[],
//   maiorPrioridade: number
// ): Solucao[] {
//   const vizinhos: Solucao[] = [];

//   // Tentar mudar a alocação de um docente de uma disciplina para outra
//   for (let i = 0; i < solucao.atribuicoes.length; i++) {
//     //const atribuicao = solucao.atribuicoes[i];

//     for (const docente of docentes) {
//       if (
//         podeAtribuir(
//           docente,
//           disciplinas[i],
//           travas,
//           solucao.atribuicoes,
//           disciplinas
//         )
//       ) {
//         const novaSolucao = JSON.parse(JSON.stringify(solucao));
//         // Remover o docente anterior, caso já tenha sido atribuído, e adicionar o novo docente
//         novaSolucao.atribuicoes[i].docentes = [docente.nome]; // Substituir o docente atual pela nova atribuição

//         // Reavaliar a nova solução após a mudança
//         novaSolucao.avaliacao = avaliarSolucao(
//           novaSolucao.atribuicoes,
//           formularios,
//           docentes,
//           disciplinas,
//           maiorPrioridade
//         );
//         vizinhos.push(novaSolucao);
//       }else {
//         const novaSolucao = JSON.parse(JSON.stringify(solucao));
//         // Remover o docente anterior, caso já tenha sido atribuído, e adicionar o novo docente
//         novaSolucao.atribuicoes[i].docentes = []; // Substituir o docente atual por nenhum

//         // Reavaliar a nova solução após a mudança
//         novaSolucao.avaliacao = avaliarSolucao(
//           novaSolucao.atribuicoes,
//           formularios,
//           docentes,
//           disciplinas,
//           maiorPrioridade
//         );
//         vizinhos.push(novaSolucao);
//       }
//     }
//   }

//   return vizinhos;
// }

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
  const novaSolucao = structuredClone(solucaoBase); // Melhor maneira de clonar objetos (se disponível)
  novaSolucao.atribuicoes[indiceAtribuicao].docentes = novosDocentes;

  // Reavaliar a nova solução após a mudança
  novaSolucao.avaliacao = avaliarSolucao(
    novaSolucao.atribuicoes,
    formularios,
    docentes,
    disciplinas,
    maiorPrioridade
  );

  return novaSolucao;
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
  const vizinhos: Solucao[] = [];
  
  // Tentar mudar a alocação de um docente de uma disciplina para outra
  for (let i = 0; i < solucao.atribuicoes.length; i++) {
    const disciplina = disciplinas[i];

    for (const docente of docentes) {
      // Verificar se o docente pode ser atribuído à disciplina
      if (podeAtribuir(docente, disciplina, travas, solucao.atribuicoes, disciplinas, formularios)) {
        // Criar nova solução com o docente atual atribuído
        const novaSolucao = criarNovaSolucao(
          solucao,
          i,
          [docente.nome],
          formularios,
          docentes,
          disciplinas,
          maiorPrioridade
        );
        vizinhos.push(novaSolucao);
      }
        // Criar uma solução sem o docente atribuído (remover docente)
        const solucaoSemDocente = criarNovaSolucao(
          solucao,
          i,
          [],
          formularios,
          docentes,
          disciplinas,
          maiorPrioridade
        );
        vizinhos.push(solucaoSemDocente);

    }
  }

  return vizinhos;
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

  // Solução inicial inclui as atribuições fornecidas pelo usuário
  let solucaoAtual: Solucao = {
    atribuicoes,
    avaliacao: avaliarSolucao(
      atribuicoes,
      formularios,
      docentes,
      disciplinas,
      maiorPrioridade
    ),
  };

  let melhorSolucao: Solucao = solucaoAtual;
  const listaTabu: Atribuicao[][] = []; // Lista tabu para evitar ciclos
  let iteracoes = 0;

  let iteracoesSemModificacao = 0

  while (/* iteracoes < maxIteracoes */ true) {
    console.log("Iterações: ", iteracoes);
    await delay(0); // Pausa
    setIteracoes(iteracoes+1)
    iteracoes++;

    // Gerar vizinhos e selecionar o melhor não tabu
    const vizinhos = gerarVizinhos(
      solucaoAtual,
      docentes,
      disciplinas,
      travas,
      formularios,
      maiorPrioridade
    );

    let melhorVizinho = vizinhos[0];
    // if(iteracoesSemModificacao >= 10) {
    //   melhorVizinho = vizinhos[1];
    // }


    // Loop para encontrar o melhor vizinho que não está na lista tabu
    for (const vizinho of vizinhos) {
      // Verifica se as atribuições do vizinho estão na lista tabu
      if (
        !estaNaListaTabu(listaTabu, vizinho.atribuicoes) &&
        vizinho.avaliacao > melhorVizinho.avaliacao // Compara avaliação
      ) {
        melhorVizinho = vizinho;
      }
    }

    // Verifica se o melhor vizinho existe
    if (melhorVizinho) {
      // Atualizar a lista tabu com o conjunto de atribuições do melhor vizinho
      atualizarListaTabu(listaTabu, melhorVizinho.atribuicoes);

      // Atualizar a solução atual e a melhor solução
      solucaoAtual = melhorVizinho;
      if (solucaoAtual.avaliacao > melhorSolucao.avaliacao) {
        melhorSolucao = solucaoAtual;
        iteracoesSemModificacao = 0; // Reseta as iterações sem modificação
        console.log("Atualizou solução para: ", melhorSolucao.avaliacao)
      } else {
        iteracoesSemModificacao++;  // Acrescenta mais um em iteração sem modificação
      }
    }

    const disciplinasSemDocente = melhorSolucao.atribuicoes.filter(atribuicao => atribuicao.docentes.length !== 0).map(atribuicao => atribuicao.id_disciplina)
    const formulariosDisciplinasPendentes = formularios.filter(formulario =>  disciplinasSemDocente.includes(formulario.id_disciplina))

    if (interrompe() || 
      (iteracoesSemModificacao === 10 && formulariosDisciplinasPendentes.length === 0 && disciplinasSemDocente.length === 0)) {
      break;
    }
  }

  return melhorSolucao;
}
