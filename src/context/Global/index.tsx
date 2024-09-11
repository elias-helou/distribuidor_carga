import { createContext, useContext, useState } from "react";

export interface Docente {
  nome: string;
  saldo?: number;
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
}

export interface Atribuicao {
  id_disciplina: string;
  docentes: Docente[];
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

export interface Trava {
  id_disciplina?: string;
  nome_docente?: string;
  tipo_trava?: TipoTrava
}

interface GlobalContextInterface {
  docentes: Docente[];
  setDocentes: React.Dispatch<React.SetStateAction<Docente[]>>;
  disciplinas: Disciplina[];
  setDisciplinas: React.Dispatch<React.SetStateAction<Disciplina[]>>;
  atribuicoes: Atribuicao[];
  setAtribuicoes: React.Dispatch<React.SetStateAction<Atribuicao[]>>;
  formularios: Formulario[];
  setFormularios: React.Dispatch<React.SetStateAction<Formulario[]>>;
  travas: Trava[];
  setTravas: React.Dispatch<React.SetStateAction<Trava[]>>;
}

const GlobalContext = createContext<GlobalContextInterface>({
  docentes: [],
  setDocentes: () => {},
  disciplinas: [],
  setDisciplinas: () => {},
  atribuicoes: [],
  setAtribuicoes: () => {},
  formularios: [],
  setFormularios: () => {},
  travas: [],
  setTravas: () => {},
});

export function GlobalWrapper({ children }: { children: React.ReactNode }) {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [atribuicoes, setAtribuicoes] = useState<Atribuicao[]>([]);
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [travas, setTravas] = useState<Trava[]>([]);

  return (
    <GlobalContext.Provider
      value={{
        docentes,
        setDocentes,
        disciplinas,
        setDisciplinas,
        atribuicoes,
        setAtribuicoes,
        formularios,
        setFormularios,
        travas,
        setTravas
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalContext() {
  return useContext(GlobalContext);
}
