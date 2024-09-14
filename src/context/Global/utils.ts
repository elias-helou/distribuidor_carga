export interface Docente {
  nome: string;
  saldo?: number;
  ativo: boolean;
}

export interface Disciplina {
  codigo: string;
  turma: number;
  nome: string;
  horario: string;
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
  ColumnCell // Identificar se, após a coluna ser destravada, a célula deve continuar travada
}

export interface Celula {
  id_disciplina?: string;
  nome_docente?: string;
  tipo_trava?: TipoTrava
}

/**
 * Verifica se um objeto é do tipo Disciplina
 * @param obj Objeto a ser verificado
 * @returns Objeto do tipo Disciplina
 */
export function isDisciplina(obj: Docente | Disciplina): obj is Disciplina {
  return 'id' in obj
}