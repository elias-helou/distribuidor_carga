import React from "react";
import { Grid2, Paper } from "@mui/material";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import DocentesTreeView from "./DocentesTreeView";
import DisciplinasTreeView from "./DisciplinasTreeView";
import TreeViewAssignments from "./TreeViewAssignments";
import { Disciplina, HistoricoSolucao } from "@/context/Global/utils";
import { TreeDisciplina, TreeDocente } from "@/app/history/components/SolutionHistoryStatistics";

// Props do DataTreeView
interface DataTreeViewProps {
  docentes: Map<string, TreeDocente>; // Map de docentes e suas disciplinas
  // atribuicoes: {
  //   id_disciplina: string;
  //   docentes: string[];
  // }[]; // Array de atribuições (disciplinas e seus docentes)
  disciplinas: Map<string, TreeDisciplina>;
  solucao: HistoricoSolucao;
  setHoveredCourese: React.Dispatch<React.SetStateAction<Disciplina>>;
}

const DataTreeView: React.FC<DataTreeViewProps> = ({
  docentes,
  disciplinas,
  solucao,
  setHoveredCourese
}) => {
  const [lastClickedItem, setLastClickedItem] = React.useState<{tipo: string, id: string} | null>(
    null
  );

  const handleLastClickedItem = (itemId: string) => {
    const item: string[] = itemId.split('_');

    /**
     * Esse item não pode ser `grid`, `child`
     */
    if(item[0] !== 'grid' && item[0] !== 'child') {
      setLastClickedItem({tipo: item[0], id: item[1]})
    } else {
      setLastClickedItem(null)
    }
  }

  return (
    <Grid2 container spacing={2}>
      <Grid2 size={5}>
        <Paper
          sx={{
            height: "25em",
            //maxWidth: "23em",
            overflowY: "auto", // Habilita o scroll vertical
          }}
          elevation={2}
        >
          <SimpleTreeView
            //  sx={{ width: "21em" }}
            onItemClick={(event, itemId) => handleLastClickedItem(itemId)}
          >
            <TreeItem
              itemId="grid_Docentes"
              label={`Docentes (${docentes.size})`}
            >
              <DocentesTreeView docentesAtribuicoes={docentes}/>
            </TreeItem>
            <TreeItem
              itemId="grid_Disciplinas"
              label={`Disciplinas (${disciplinas.size})`}
            >
              <DisciplinasTreeView disciplinas={disciplinas} />
            </TreeItem>
          </SimpleTreeView>
        </Paper>
      </Grid2>
      <Grid2 size={7}>
        <TreeViewAssignments item={lastClickedItem} solucao={solucao} setHoveredCourese={setHoveredCourese}/>
      </Grid2>
    </Grid2>
  );
};

export default DataTreeView;
