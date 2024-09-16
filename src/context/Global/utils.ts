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
