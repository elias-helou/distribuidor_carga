import { useGlobalContext } from "../Global";
import { HistoricoSolucao } from "../Global/utils";

/**
 * Hook customizado para remover uma solução do histórico pelo seu identificador.
 * Retorna uma função que pode ser chamada para remover a solução.
 * 
 * @returns {Function} Função que remove uma solução do histórico pelo id.
 */
export const useSolutionHistory = () => {
  // Obtém o contexto global
  const { historicoSolucoes, setHistoricoSolucoes, updateAtribuicoes, setSolucaoAtual, solucaoAtual } = useGlobalContext();

  // Função para remover a solução do histórico
  const removeSolutionFromHistory = (id: string) => {
    // Cria uma nova instância do Map para garantir imutabilidade
    const newHistoricoSolucoesMap: Map<string, HistoricoSolucao> = new Map<string, HistoricoSolucao>(historicoSolucoes);

    // Remove a solução pelo id
    newHistoricoSolucoesMap.delete(id);

    // Atualiza o estado com o novo Map
    setHistoricoSolucoes(newHistoricoSolucoesMap);
  };

  const restoreHistoryToSolution = (id: string) => {
    /**
     * Passos
     * 1 - Atualizar state solucaoAtual
     * 2 - Atualizar state atribuicoes
     */
    const solutionToRestore = historicoSolucoes.get(id);

    setSolucaoAtual(solutionToRestore.solucao)

    updateAtribuicoes(solutionToRestore.solucao.atribuicoes)
  }

  // Retorna a função de remoção, que pode ser usada em componentes
  return {removeSolutionFromHistory, restoreHistoryToSolution, solucaoAtual};
};
