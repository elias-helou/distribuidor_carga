import {
  Celula as Trava,
  Disciplina,
  Docente,
  Atribuicao,
  Formulario,
} from "@/context/Global/utils";
import {
  ajustaHorarioDisciplinas,
  atualizarListaTabu,
  estaNaListaTabu,
  horariosSobrepoem,
} from "./utils";

interface Solucao {
  atribuicoes: Atribuicao[];
  avaliacao: number;
}

// Função para checar se um docente pode ser alocado a uma disciplina
function podeAtribuir(
  docente: Docente,
  disciplina: Disciplina,
  travas: Trava[],
  atribuicoes: Atribuicao[],
  disciplinas: Disciplina[]
): boolean {
  // Verificar se o docente está ativo
  if (!docente.ativo || !disciplina.ativo) return false;

  // Verificar se o docente está na lista de travas para a disciplina
  for (const trava of travas) {
    if (
      trava.id_disciplina === disciplina.id &&
      trava.nome_docente === docente.nome
    ) {
      return false;
    }
  }

  const docenteDisciplinasAtribuidas: string[] = atribuicoes
    .filter((atribuicao) => atribuicao.docentes.includes(docente.nome))
    .map((atribuicao) => atribuicao.id_disciplina);

  const docenteDisciplinas: Disciplina[] = disciplinas.filter((disciplina) =>
    docenteDisciplinasAtribuidas.includes(disciplina.id)
  );

  // Verificar se o docente já foi atribuído a alguma disciplina no mesmo horário
  for (const docenteDisciplina of docenteDisciplinas) {
    for (const horarioDisciplina of docenteDisciplina.horario) {
      for (const horarioAtual of disciplina.horario) {
        if (horariosSobrepoem(horarioAtual, horarioDisciplina)) {
          return false;
        }
      }
    }
  }

  // Verifica se o docente já não está atribuido a disciplina
  if (docenteDisciplinasAtribuidas.includes(disciplina.id)) {
    return false;
  }

  // Verifica se a disciplina já apresenta um docente atribuído
  const discAtribuicao: Atribuicao = atribuicoes.filter(
    (atribuicao) => atribuicao.id_disciplina == disciplina.id
  )[0];
  if (discAtribuicao.docentes.length > 0) {
    return false;
  }

  return true;
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
  for (const formulario of formularios) {
    const atribuicao = atribuicoes.find(
      (a) => a.id_disciplina === formulario.id_disciplina
    );
    if (atribuicao && atribuicao.docentes.includes(formulario.nome_professor)) {
      avaliacao += maiorPrioridade - formulario.prioridade;
    } else {
      avaliacao - +maiorPrioridade + 1; // Docente atrubuído sem prioridade definida
    }
  }

  // Penalizar por disciplinas sem professor ou com mais de um professor
  for (const atribuicao of atribuicoes) {
    if (atribuicao.docentes.length === 0 || atribuicao.docentes.length > 1) {
      avaliacao -= 10; // Penalidade por disciplina sem professor
    }
  }

  return avaliacao;
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
    //const atribuicao = solucao.atribuicoes[i];

    for (const docente of docentes) {
      if (
        podeAtribuir(
          docente,
          disciplinas[i],
          travas,
          solucao.atribuicoes,
          disciplinas
        )
      ) {
        const novaSolucao = JSON.parse(JSON.stringify(solucao));
        novaSolucao.atribuicoes[i].docentes.push(docente.nome);
        novaSolucao.avaliacao = avaliarSolucao(
          novaSolucao.atribuicoes,
          formularios,
          docentes,
          disciplinas,
          maiorPrioridade
        );
        vizinhos.push(novaSolucao);
      }
    }
  }

  return vizinhos;
}

// Algoritmo de Busca Tabu
export function buscaTabu(
  disciplinas: Disciplina[],
  docentes: Docente[],
  formularios: Formulario[],
  travas: Trava[],
  maxIteracoes: number,
  maiorPrioridade: number
): Solucao {
  const atribuicoes: Atribuicao[] = disciplinas.map((d) => ({
    id_disciplina: d.id,
    docentes: [],
  }));
  // Chamar a função que irá ajustar o formato do atributo horario
  const disciplinasAjustadas: Disciplina[] =
    ajustaHorarioDisciplinas(disciplinas);

  let solucaoAtual: Solucao = {
    atribuicoes,
    avaliacao: avaliarSolucao(
      atribuicoes,
      formularios,
      docentes,
      disciplinasAjustadas,
      maiorPrioridade
    ),
  };
  let melhorSolucao: Solucao = solucaoAtual;

  const listaTabu: Atribuicao[][] = []; // Lista tabu para evitar ciclos
  let iteracoes = 0;

  while (iteracoes < maxIteracoes) {
    iteracoes++;

    // Gerar vizinhos e selecionar o melhor não tabu
    const vizinhos = gerarVizinhos(
      solucaoAtual,
      docentes,
      disciplinasAjustadas,
      travas,
      formularios,
      maiorPrioridade
    );
    let melhorVizinho = vizinhos[0];

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
      }
    }
  }
  return melhorSolucao;
}
