import {
  Atribuicao,
  Disciplina,
  Docente,
  Formulario,
} from "@/context/Global/utils";
import {
  TreeDisciplina,
  TreeDocente,
} from "./components/SolutionHistoryStatistics";

/**
 * Função para contra quantas atribuições um docente ativo teve.
 * @param docentes
 * @param atribuicoes
 * @returns Retorna um Map com key sendo o nome do docente e value a quantidade de alocações para eles.
 */
export function getDocentesQtdAtribuicoes(
  docentes: Docente[],
  atribuicoes: Atribuicao[]
): Map<string, number> {
  const qtdAtribuicoes = new Map<string, number>(); // nome, qtd

  for (const docente of docentes) {
    let qtd = 0;

    for (const atribuicao of atribuicoes) {
      if (atribuicao.docentes.includes(docente.nome)) {
        qtd += 1;
      }
    }

    qtdAtribuicoes.set(docente.nome, qtd);
  }

  return qtdAtribuicoes;
}

export function getDocentesAtribuicoes(
  docentes: Docente[],
  atribuicoes: Atribuicao[]
): Map<string, string[]> {
  const docentesAtribuicoes = new Map<string, string[]>(); // nome, disciplinas

  for (const docente of docentes) {
    const docenteAtribuicoes = [];

    for (const atribuicao of atribuicoes) {
      if (atribuicao.docentes.includes(docente.nome)) {
        docenteAtribuicoes.push(atribuicao.id_disciplina);
      }
    }

    docentesAtribuicoes.set(docente.nome, docenteAtribuicoes);
  }

  return docentesAtribuicoes;
}

export function getDisciplinasAtribuicoes(
  disciplinas: Disciplina[],
  atribuicoes: Atribuicao[]
): Map<string, string[]> {
  const disciplinasAtribuicoes = new Map<string, string[]>(); // id, docentes

  for (const disciplina of disciplinas) {
    const disciplinaAtribuicoes = atribuicoes.find(
      (atribuicao) => atribuicao.id_disciplina === disciplina.id
    );

    disciplinasAtribuicoes.set(disciplina.id, disciplinaAtribuicoes.docentes);
  }

  return disciplinasAtribuicoes;
}

/**
 *
 * @param texto
 * @returns
 */
export function extrairCursos(texto: string) {
  // Remove a parte inicial fixa, considerando "Curso" e "Cursos"
  const textoLimpo = texto.replace(/^Cursos?:<br>&emsp;/, "");

  // Divide o texto usando os delimitadores específicos e cuida do caso de quebras de linha
  const cursos = textoLimpo
    .split(/,&emsp;|,<br>&emsp;|<br>&emsp;/)
    .map((curso) => curso.trim());

  return cursos;
}

/**
 *
 * @param disciplinasAtribuicoes
 * @param docentesAtribuicoes
 * @param docentes
 * @param disciplinas
 * @param formularios Apenas os formularios com docentes e disciplinas ativas
 */
export function processAtribuicoesToTree(
  disciplinasAtribuicoes: Map<string, string[]>,
  docentesAtribuicoes: Map<string, string[]>,
  docentes: Docente[],
  disciplinas: Disciplina[],
  formularios: Formulario[]
) {
  const treeDisciplinas = new Map<string, TreeDisciplina>();
  const treeDocentes = new Map<string, TreeDocente>();

  for (const docenteAtribuicoes of docentesAtribuicoes.keys()) {
    //const _docente = docentes.find(docente => docente.nome === docenteAtribuicoes);
    const _atribuicoes = docentesAtribuicoes.get(docenteAtribuicoes);

    // Docente processado
    const atribuicoes: Map<string, TreeDisciplina> = new Map<
      string,
      TreeDisciplina
    >();
    const docente: TreeDocente = {
      ...docentes.find((docente) => docente.nome === docenteAtribuicoes),
      atribuicoes: atribuicoes,
    };

    /**
     * Passar pelas atribuições, verificar se já existem no map treeDisciplinas, caso negativo criar
     */
    for (const atribuicao of _atribuicoes) {
      if (!treeDisciplinas.has(atribuicao)) {
        const disciplina = disciplinas.find(
          (disciplina) => disciplina.id === atribuicao
        );

        const docenteFormularioDisciplina = formularios.find(
          (formulario) =>
            formulario.id_disciplina === atribuicao &&
            formulario.nome_docente === docente.nome
        );

        const formulariosMap = new Map<
          string,
          TreeDocente & { prioridade: number | null }
        >();
        
        if(docenteFormularioDisciplina !== undefined) {
             formulariosMap.set(docente.nome, {
            ...docente,
            prioridade: docenteFormularioDisciplina.prioridade,
            });
        }

        const treeDisciplina: TreeDisciplina = {
          ...disciplina,
          formularios: formulariosMap,
          _cursos: extrairCursos(disciplina.cursos),
          atribuicoes: new Map<string, TreeDocente & { prioridade: number | null }>(),
        };

        treeDisciplina.atribuicoes.set(docente.nome, {
          ...docente,
          prioridade: docenteFormularioDisciplina?.prioridade,
        });

        treeDisciplinas.set(treeDisciplina.id, treeDisciplina);

        docente.atribuicoes.set(treeDisciplina.id, treeDisciplina);
      } else {
        // Se já existir, apenas adicionar o docente
        const treeDisciplina = treeDisciplinas.get(atribuicao);
        const docenteFormularioDisciplina = formularios.find(
          (formulario) =>
            formulario.id_disciplina === atribuicao &&
            formulario.nome_docente === docente.nome
        );

        if(docenteFormularioDisciplina !== undefined) {
            treeDisciplina.formularios.set(docente.nome, {
             ...docente,
            prioridade: docenteFormularioDisciplina?.prioridade,
            });
        }
        
        treeDisciplina.atribuicoes.set(docente.nome, {
          ...docente,
          prioridade: docenteFormularioDisciplina?.prioridade,
        });

        treeDisciplinas.set(treeDisciplina.id, treeDisciplina);
        docente.atribuicoes.set(treeDisciplina.id, treeDisciplina);
      }
    }

    // Adiciona docente processado ao map
    treeDocentes.set(docente.nome, docente);
  }

  for (const disciplinaAtribuicoes of disciplinasAtribuicoes.keys()) {
    if (!treeDisciplinas.has(disciplinaAtribuicoes)) {
      const disciplina = disciplinas.find(
        (disciplina) => disciplina.id === disciplinaAtribuicoes
      );
      const formulariosDisciplina = formularios.filter(
        (formulario) => formulario.id_disciplina === disciplinaAtribuicoes
      );

      const formulariosMap = new Map<
        string,
        TreeDocente & { prioridade: number }
      >();
      for (const formulario of formulariosDisciplina) {
        const docente = treeDocentes.get(formulario.nome_docente);
        formulariosMap.set(docente.nome, {
          ...docente,
          prioridade: formulario?.prioridade,
        });
      }

      // Cria as atribuições
      const atribuicoesMap = new Map<
        string,
        TreeDocente & { prioridade: number | null }
      >();

      const _atribuicoes = disciplinasAtribuicoes.get(disciplinaAtribuicoes);

      for (const _docente of _atribuicoes) {
        const prioridade = formulariosMap.get(_docente)?.prioridade;
        const docente = treeDocentes.get(_docente);
        atribuicoesMap.set(_docente, {...docente, prioridade: prioridade});
      }

      const treeDicsiplina: TreeDisciplina = {
        ...disciplina,
        formularios: formulariosMap,
        _cursos: extrairCursos(disciplina.cursos),
        atribuicoes: atribuicoesMap,
      };

      treeDisciplinas.set(treeDicsiplina.id, treeDicsiplina);
    } else {
      // Já existe, apenas atualizar os formulários/docentes
      const treeDicsiplina = treeDisciplinas.get(disciplinaAtribuicoes);
      const formulariosDisciplina = formularios.filter(
        (formulario) => formulario.id_disciplina === disciplinaAtribuicoes
      );

      const formulariosMap = new Map<
        string,
        TreeDocente & { prioridade: number }
      >();

      for (const formulario of formulariosDisciplina) {
        const docente = treeDocentes.get(formulario.nome_docente);
        formulariosMap.set(docente.nome, {
          ...docente,
          prioridade: formulario?.prioridade,
        });
      }

      treeDicsiplina.formularios = formulariosMap;

      // Cria as atribuições
      //const atribuicoesMap = new Map<string, TreeDocente & {prioridade: number|null}>();

      const _atribuicoes = disciplinasAtribuicoes.get(disciplinaAtribuicoes);

      for (const _docente of _atribuicoes) {
        const prioridade = treeDicsiplina.formularios.get(_docente)?.prioridade;
        const docente = treeDocentes.get(_docente);
        treeDicsiplina.atribuicoes.set(
          _docente,
          {...docente, prioridade: prioridade}
        );
      }

      treeDisciplinas.set(treeDicsiplina.id, treeDicsiplina);
    }
  }

  return { treeDisciplinas: treeDisciplinas, treeDocentes: treeDocentes };
}
