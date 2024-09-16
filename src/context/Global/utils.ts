export interface Docente {
  nome: string;
  saldo?: number;
  ativo: boolean;
}

export interface Disciplina {
  codigo: string;
  turma: number;
  nome: string;
  horario: Horario[] | string;
  cursos: string;
  ementa: string;
  id: string;
  nivel: string;
  prioridade: number;
  noturna: boolean;
  ingles: boolean;
  docentes?: string[];
  ativo: boolean;
}

export interface Atribuicao {
  id_disciplina: string;
  docentes: string[];
}

export interface Formulario {
  id_disciplina: string;
  nome_professor: string;
  prioridade: number;
}

export enum TipoTrava {
  Column,
  Row,
  Cell,
  ColumnCell, // Identificar se, após a coluna ser destravada, a célula deve continuar travada
}

export interface Celula {
  id_disciplina?: string;
  nome_docente?: string;
  tipo_trava?: TipoTrava;
}

// Ver se o melhor lugar para essa interface é aqui
export interface Horario {
  dia: "Seg." | "Ter." | "Qua." | "Qui." | "Sex.";
  inicio: string;
  fim: string;
}

/**
 * Verifica se um objeto é do tipo Disciplina
 * @param obj Objeto a ser verificado
 * @returns Objeto do tipo Disciplina
 */
export function isDisciplina(obj: Docente | Disciplina): obj is Disciplina {
  return "id" in obj;
}

/**
 * Verifica se o objeto fornecido é do tipo Horario.
 * @param obj O objeto a ser verificado.
 * @returns Booleano indicando se o objeto é um Horario.
 */
export function isHorario(obj: string | Horario): obj is Horario {
  return typeof obj !== 'string' &&
         obj !== null &&
         typeof obj === 'object' &&
         'dia' in obj &&
         'inicio' in obj &&
         'fim' in obj;
}

/**
 * Função utilizada para clonar um state da aplicação.
 * @param arr State da aplicação a ser clonado.
 * @returns Uma lista do mesmo tipo do parâmetro informado.
 */
export function cloneDeepArray<T>(arr: T[]): T[] {
  return arr.map((item) => cloneDeep(item));
}

/**
 * Função utilizada para clonar um objeto ou array.
 * @param obj Objeto ou array a ser clonado.
 * @returns Uma cópia do objeto ou array fornecido.
 */
export function cloneDeep<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj; // Retorna o valor primitivo (não um objeto)
  }

  if (Array.isArray(obj)) {
    return cloneDeepArray(obj) as T; // Clona cada item do array
  }

  // Cria um novo objeto e clona cada propriedade recursivamente
  const result = Object.create(Object.getPrototypeOf(obj)) as T;
  for (const key of Object.keys(obj)) {
    (result as any)[key] = cloneDeep((obj as any)[key]);
  }
  return result;
}

/**
 * Função que retorna os itens ativos (onde ativo === true) de um array de objetos.
 * @param obj Array de objetos que possuem a propriedade 'ativo'.
 * @returns Um novo array filtrado apenas com os itens onde 'ativo' é true.
 */
export function getActives<T extends { ativo: boolean }>(obj: T[]): T[] {
  // Retorna um array filtrado apenas com os itens onde ativo é true
  return obj.filter((item) => item.ativo);
}

/**
 * Função responsável por realizar todos os pré-processamentos necessários nos parâmetros da função de busca tabu
 * @param disciplinas Disciplinas a serem filtradas e copiadas para não alterar o state global.
 * @param docentes Docentes a serem filtrados.
 * @param formularios Formularios a serem filtrados, apenas com disciplinas e docentes ativos.
 * @param travas Travas a serem filtradas, apenas com disciplinas e docentes ativos.
 * @param atribuicoes Atribuições a serem filtradas, mantendo apenas disciplinas ativas e removendo da lista de docentes os não ativos.
 * @returns Um objeto com todos os parâmetros processados.
 */
export function processData(
  disciplinas: Disciplina[],
  docentes: Docente[],
  formularios: Formulario[],
  travas: Celula[],
  atribuicoes: Atribuicao[]
) {
  const processedDisciplinas: Disciplina[] = cloneDeep(getActives(disciplinas));
  const processedDocentes: Docente[] = getActives(docentes);

  // Pré-processar as disciplinas e docentes ativos em um mapa para acesso rápido
  const disciplinasAtivas = new Set(
    disciplinas
      .filter((disciplina) => disciplina.ativo)
      .map((disciplina) => disciplina.id)
  );
  const docentesAtivos = new Set(
    docentes.filter((docente) => docente.ativo).map((docente) => docente.nome)
  );

  // Filtrar os formularios com base nas disciplinas e docentes ativos
  const processedFormularios: Formulario[] = formularios.filter(
    (formulario) =>
      disciplinasAtivas.has(formulario.id_disciplina) &&
      docentesAtivos.has(formulario.nome_professor)
  );

  // Filtrar as travas com base nas disciplinas e docentes ativos
  const processedTravas: Celula[] = travas.filter(
    (trava) =>
      disciplinasAtivas.has(trava.id_disciplina) &&
      docentesAtivos.has(trava.nome_docente)
  );

  // Filtrar as atribuições com base nas disciplinas e docentes ativos
  const processedAtribuicoes: Atribuicao[] = atribuicoes
    .filter((atribuicao) => disciplinasAtivas.has(atribuicao.id_disciplina)) // Mantém apenas atribuições com disciplinas ativas
    .map((atribuicao) => {
      // Filtrar os docentes ativos em cada atribuição
      return {
        ...atribuicao,
        docentes: atribuicao.docentes.filter((docente) =>
          docentesAtivos.has(docente)
        ), // Mantém apenas os docentes ativos
      };
    });

  // p -> Processados
  return {
    pDisciplinas: processedDisciplinas,
    pDocentes: processedDocentes,
    pFormularios: processedFormularios,
    pTravas: processedTravas,
    pAtribuicoes: processedAtribuicoes,
  };
}