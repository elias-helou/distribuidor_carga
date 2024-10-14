import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  Atribuicao,
  Celula,
  Disciplina,
  Docente,
  Formulario,
  HistoricoSolucao,
  Solucao,
} from "./utils";

import _ from "lodash"; // Comparação entre objetos de forma otimizada

interface GlobalContextInterface {
  docentes: Docente[];
  setDocentes: React.Dispatch<React.SetStateAction<Docente[]>>;
  disciplinas: Disciplina[];
  setDisciplinas: React.Dispatch<React.SetStateAction<Disciplina[]>>;
  atribuicoes: Atribuicao[];
  setAtribuicoes: React.Dispatch<React.SetStateAction<Atribuicao[]>>;
  formularios: Formulario[]; // Tocar para um hashMap
  setFormularios: React.Dispatch<React.SetStateAction<Formulario[]>>;
  travas: Celula[];
  setTravas: React.Dispatch<React.SetStateAction<Celula[]>>;

  /**
   * Histórico de soluções
   */
  historicoSolucoes: Map<string, HistoricoSolucao>;
  setHistoricoSolucoes: React.Dispatch<
    React.SetStateAction<Map<string, HistoricoSolucao>>
  >;
  solucaoAtual: Solucao;
  setSolucaoAtual: React.Dispatch<React.SetStateAction<Solucao>>;
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
  historicoSolucoes: new Map<string, HistoricoSolucao>(),
  setHistoricoSolucoes: () => {},
  solucaoAtual: {
    atribuicoes: [],
    avaliacao: undefined,
    idHistorico: undefined,
  },
  setSolucaoAtual: () => {},
});

export function GlobalWrapper({ children }: { children: React.ReactNode }) {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [atribuicoes, setAtribuicoes] = useState<Atribuicao[]>([]);
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [travas, setTravas] = useState<Celula[]>([]);

  /**
   * Histórico de soluções
   */
  const [historicoSolucoes, setHistoricoSolucoes] = useState<
    Map<string, HistoricoSolucao>
  >(new Map<string, HistoricoSolucao>());
  const [solucaoAtual, setSolucaoAtual] = useState<Solucao>({
    atribuicoes: [],
    avaliacao: undefined,
    idHistorico: undefined,
  });

  /**
   * Caso ocorra alguma modificação nos states globais, o id da solução deve ser alterado para undefined, permitindo salvar essas
   * novas modificações
   */
  // useRef para armazenar os valores anteriores
  const prevDocentesRef = useRef(docentes);
  const prevDisciplinasRef = useRef(disciplinas);
  const prevTravasRef = useRef(travas);
  const prevAtribuicoesRef = useRef(atribuicoes);
  const prevSolucaoAtualRef = useRef(solucaoAtual);
  const prevHistoricoSolucoes = useRef(historicoSolucoes);

  const [somethingChanged, setSomethingChanged] = useState(false);

  useEffect(() => {
    if(solucaoAtual.idHistorico !== undefined) {
      const hasChanges = () => {
      return (
        !_.isEqual(prevDocentesRef.current, docentes) ||
        !_.isEqual(prevDisciplinasRef.current, disciplinas) ||
        !_.isEqual(prevTravasRef.current, travas) ||
        !_.isEqual(prevAtribuicoesRef.current, atribuicoes)
      );
    };

    const restoring = () => {
      return (
        prevSolucaoAtualRef.current.idHistorico !== undefined &&
        solucaoAtual.idHistorico !== undefined &&
        prevSolucaoAtualRef.current.idHistorico !== solucaoAtual.idHistorico &&
        prevHistoricoSolucoes.current.has(
          prevSolucaoAtualRef.current.idHistorico
        ) &&
        prevHistoricoSolucoes.current.has(solucaoAtual.idHistorico)
      );
    };

    /**
     * Uma coisa está sendo adicionada quando a anteior não tinha e a atual tem
     */
    const adding = () => {
      return(!prevHistoricoSolucoes.current.has(solucaoAtual.idHistorico) && historicoSolucoes.has(solucaoAtual.idHistorico))
    }

    // Verifica se houve mudanças
    if (!somethingChanged && hasChanges() && !restoring() && !adding()) {
      setSomethingChanged(true);
    }

    // Aqui, verifica se estamos em um estado alterado
    if (somethingChanged) {
      // Se não estamos restaurando, mudamos o idHistorico para undefined
      if (!restoring() && !adding()) {
        setSolucaoAtual({
          ...solucaoAtual,
          idHistorico: undefined,
        });
      }
      setSomethingChanged(false); // Reseta a flag de mudança
    }

    // Atualiza as referências com os valores atuais
    prevDocentesRef.current = docentes;
    prevDisciplinasRef.current = disciplinas;
    prevTravasRef.current = travas;
    prevAtribuicoesRef.current = atribuicoes;
    prevSolucaoAtualRef.current = solucaoAtual; // Atualizando a referência atual
    prevHistoricoSolucoes.current = historicoSolucoes;
    }
  }, [
    docentes,
    disciplinas,
    travas,
    atribuicoes,
    somethingChanged,
    solucaoAtual,
    historicoSolucoes,
  ]);

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
        setTravas,
        historicoSolucoes,
        setHistoricoSolucoes,
        setSolucaoAtual,
        solucaoAtual,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

/**
 * Hooks
 */
export function useGlobalContext() {
  const context = useContext(GlobalContext);

  /**
   * Atualizar as atribuições com uma solução
   * @param novasAtribuicoes
   */
  function updateAtribuicoes(novasAtribuicoes: Atribuicao[]) {
    /** Alterar para ver o state solucaoAtual */
    if (context.atribuicoes.length == novasAtribuicoes.length) {
      context.setAtribuicoes(novasAtribuicoes);
    } else {
      const newAtribuicoes = [...context.atribuicoes]; // Cria uma cópia do array original

      for (const newAtribuicao of novasAtribuicoes) {
        // Encontra a atribuição correspondente no array copiado
        const index = newAtribuicoes.findIndex(
          (atribuicao) =>
            atribuicao.id_disciplina === newAtribuicao.id_disciplina
        );

        if (index !== -1) {
          // Atualiza os docentes da atribuição encontrada, evitando duplicações
          newAtribuicoes[index] = {
            ...newAtribuicoes[index],
            docentes: [
              ...newAtribuicoes[index].docentes.filter(
                (docente) => !newAtribuicao.docentes.includes(docente)
              ),
              ...newAtribuicao.docentes,
            ],
          };
        }
      }

      // Atualiza o estado com o novo array de atribuições modificado
      context.setAtribuicoes(newAtribuicoes);
    }
  }
  return { ...context, updateAtribuicoes };
}
