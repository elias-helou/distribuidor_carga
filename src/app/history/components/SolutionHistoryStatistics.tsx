import LineChartsSelector from "@/components/SolutionHistoryStatistics/LineChartsSelector";
import { useGlobalContext } from "@/context/Global";
import { HistoricoSolucao } from "@/context/Global/utils";
import { Grid2, Paper } from "@mui/material";
import { getDocentesAtribuicoes } from "../utils";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";

interface SolutionHistoryStatisticsProps {
  id: string;
  solucao: HistoricoSolucao;
}

const SolutionHistoryStatistics: React.FC<SolutionHistoryStatisticsProps> = ({
  id,
  solucao,
}) => {
  const { docentes } = useGlobalContext();

  const renderTreeView = () => {
    /**
     * Docentes
     */
    const docentesTree = [];
    const docentesAtribuicoes: Map<string, string[]> = getDocentesAtribuicoes(
      docentes.filter((docente) => docente.ativo),
      solucao.solucao.atribuicoes
    );

    docentesAtribuicoes.forEach((value, key) => {
      const atribuicoesTree = [];

      for (const disciplina of value) {
        atribuicoesTree.push(
          <TreeItem
            key={`child_docente_${key}_${disciplina}`}
            itemId={`child_docente_${key}_${disciplina}`}
            label={`${disciplina}`}
          />
        );
      }
      docentesTree.push(
        <TreeItem
          key={`docente_${key}`}
          itemId={`docente_${key}`}
          label={`${key} (${value.length})`}
        >
          {atribuicoesTree}
        </TreeItem>
      );
    });

    /**
     * Disciplinas
     */
    const turmasTree = [];
    for (const atribuicao of solucao.solucao.atribuicoes) {
      const docentesAtribuidosTree = [];

      for (const docente of atribuicao.docentes) {
        docentesAtribuidosTree.push(
          <TreeItem
            key={`child_disciplina_${atribuicao.id_disciplina}_${docente}`}
            itemId={`child_disciplina_${atribuicao.id_disciplina}_${docente}`}
            label={`${docente}`}
          />
        );
      }

      turmasTree.push(
        <TreeItem
          key={`disciplona_${atribuicao.id_disciplina}`}
          itemId={`disciplona_${atribuicao.id_disciplina}`}
          label={`${atribuicao.id_disciplina} (${atribuicao.docentes.length})`}
        >
          {docentesAtribuidosTree}
        </TreeItem>
      );
    }

    return (
      <Paper
        sx={{
          maxHeight: 352,
          minWidth: 230,
          overflowY: "auto", // Adicionado para permitir o scroll vertical
        }}
        elevation={2}
      >
        <SimpleTreeView>
          <TreeItem
            itemId="grid_Docentes"
            label={`Docentes (${docentesAtribuicoes.size})`}
          >
            {docentesTree}
          </TreeItem>
          <TreeItem
            itemId="grid_Disciplinas"
            label={`Disciplinas (${turmasTree.length})`}
          >
            {turmasTree}
          </TreeItem>
        </SimpleTreeView>
      </Paper>
    );
  };

  return (
    <Grid2 container spacing={2} key={`grid2_container_${id}`}>
      {solucao.solucao.estatisticas !== undefined && (
        <Grid2>
          <LineChartsSelector solucao={solucao} />
        </Grid2>
      )}
      <Grid2>{renderTreeView()}</Grid2>
    </Grid2>
  );
};

export default SolutionHistoryStatistics;
