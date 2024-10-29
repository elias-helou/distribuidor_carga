import { createContext, useContext, useState } from "react";
import {
  Atribuicao,
  Celula,
  Disciplina,
  Docente,
  Formulario,
  HistoricoSolucao,
  Parametros,
  Solucao,
} from "./utils";

//import _ from "lodash"; // Comparação entre objetos de forma otimizada

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

  /**
   * Mudar de local
   */
  parametros: Parametros;
  setParametros: React.Dispatch<React.SetStateAction<Parametros>>;
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
  parametros: {k1: 0, k2: 0, k3: 0, k4: 0, k5: 0, k6: 0},
  setParametros: () => {}
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
   * Mudar de lugar
   */
  const [parametros, setParametros] = useState<Parametros>({k1: 1000, k2: 100000, k3: 100, k4: 10000, k5: 1000, k6: 0});

//   /**
//    * Caso ocorra alguma modificação nos states globais, o id da solução deve ser alterado para undefined, permitindo salvar essas
//    * novas modificações
//    */
//   // useRef para armazenar os valores anteriores
//   const prevDocentesRef = useRef(docentes);
//   const prevDisciplinasRef = useRef(disciplinas);
//   const prevTravasRef = useRef(travas);
//   const prevAtribuicoesRef = useRef(atribuicoes);
//   const prevSolucaoAtualRef = useRef(solucaoAtual);
//   const prevHistoricoSolucoes = useRef(historicoSolucoes);

// // UseRef para rastrear o último estado definido de `solucaoAtual`
// const lastSolucaoAtualRef = useRef(solucaoAtual);

// useEffect(() => {
//   // Só executa se há um idHistorico válido, ignorando estados indefinidos de `solucaoAtual`
//   if (solucaoAtual.idHistorico !== undefined) {
    
//     // Função para verificar se houve mudanças nos estados observados
//     const hasChanges = () => {
//       return (
//         !_.isEqual(prevDocentesRef.current, docentes) ||
//         !_.isEqual(prevDisciplinasRef.current, disciplinas) ||
//         !_.isEqual(prevTravasRef.current, travas) ||
//         !_.isEqual(prevAtribuicoesRef.current, atribuicoes)
//       );
//     };

//     // Função de restauração: verifica se estamos restaurando um histórico existente
//     const restoring = () => {
//       return (
//         prevSolucaoAtualRef.current.idHistorico !== undefined &&
//         solucaoAtual.idHistorico !== undefined &&
//         prevSolucaoAtualRef.current.idHistorico !== solucaoAtual.idHistorico &&
//         prevHistoricoSolucoes.current.has(
//           prevSolucaoAtualRef.current.idHistorico
//         ) &&
//         prevHistoricoSolucoes.current.has(solucaoAtual.idHistorico)
//       );
//     };

//     // Função de adição: verifica se estamos adicionando um histórico novo
//     const adding = () => {
//       return (
//         !prevHistoricoSolucoes.current.has(solucaoAtual.idHistorico) &&
//         historicoSolucoes.has(solucaoAtual.idHistorico)
//       );
//     };

//     // Verifica se houve mudanças significativas e se não estamos restaurando ou adicionando
//     if (hasChanges() && !restoring() && !adding()) {
//       // Redefine `solucaoAtual` para o estado inicial apenas se ele realmente mudou
//       setSolucaoAtual({
//         atribuicoes: [],
//         avaliacao: undefined,
//         idHistorico: undefined,
//         estatisticas: undefined,
//       });

//       // Armazena o novo estado redefinido em `lastSolucaoAtualRef`
//       lastSolucaoAtualRef.current = {
//         atribuicoes: [],
//         avaliacao: undefined,
//         idHistorico: undefined,
//         estatisticas: undefined,
//       };
//     } else if (restoring() || adding()) {
//       // Em caso de restauração ou adição, atualizamos `prevSolucaoAtualRef` com `solucaoAtual`
//       prevSolucaoAtualRef.current = solucaoAtual;
//       lastSolucaoAtualRef.current = solucaoAtual; // Atualiza o estado conhecido
//     }

//     // Atualiza as referências de estado para o próximo ciclo
//     prevDocentesRef.current = docentes;
//     prevDisciplinasRef.current = disciplinas;
//     prevTravasRef.current = travas;
//     prevAtribuicoesRef.current = atribuicoes;
//     prevHistoricoSolucoes.current = historicoSolucoes;

//     console.log("Último estado conhecido de Solução:", lastSolucaoAtualRef.current);
//     console.log("Solução Atual:", solucaoAtual);
//     console.log("----------------------------------");
//   }
// }, [
//   docentes,
//   disciplinas,
//   travas,
//   atribuicoes,
//   solucaoAtual,
//   historicoSolucoes,
// ]);

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
        parametros,
        setParametros
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
