import {
  Atribuicao,
  Celula,
  Disciplina,
  Docente,
  Formulario,
} from "@/context/Global/utils";

export interface Context {
  atribuicoes: Atribuicao[];
  docentes: Docente[];
  turmas: Disciplina[];
  travas: Celula[];
  prioridades: Formulario[];
  maiorPrioridade?: number;
}

export interface Vizinho {
  atribuicoes: Atribuicao[];
  movimentos: { add: any[]; drop: any[] }; // Depois será melhor acertar as tipagens
  isTabu: boolean;
  avaliacao?: number;
}
