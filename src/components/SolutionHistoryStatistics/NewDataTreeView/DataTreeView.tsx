import {
  TreeDisciplina,
  TreeDocente,
} from "@/app/history/components/SolutionHistoryStatistics";
import { Grid2, Paper } from "@mui/material";
import DocenteTreeView from "./DocenteTreeView";
import DisciplinasTreeView from "./DisciplinasTreeView";
import { useState } from "react";

export interface DataTreeViewProps {
  docentes: Map<string, TreeDocente>;
  disciplinas: Map<string, TreeDisciplina>;
}

export default function NewDataTreeView({
  docentes,
  disciplinas,
}: DataTreeViewProps) {

    const [lastClickedItem, setLastClickedItem] = useState<{
    tipo: string;
    id: string;
  } | null>(null);

  /**
   * Exemplo:
   *  - Docente: ['item', 'docente', 'José Bieco']
   *  - Disciplina dentro do Docente: ['child', 'docente', 'José Bieco', 'disciplina', 'SME0284,1']
   * 
   *  - Disciplina: ['item', 'disciplina', 'SME0284,1']
   * - Docente dentro da Disciplina: ['child', 'disciplina', 'SME0284,1', 'docente', 'José Bieco']
   */
  const handleLastClickedItem = (itemId: string) => {
    if(itemId !== "0") {
      const tokens = itemId.split('_');
      if(tokens[0] === "item") {
        setLastClickedItem({tipo: tokens[1], id: tokens[2]});
      } else {
        setLastClickedItem({tipo: tokens[3], id: tokens[4]});
      }
    }
  }

  return (
    <Grid2 container size={{ xs: 12 }} spacing={2}>
      <Grid2 size={{ xs: 12, md: 6 }}>
        <Paper elevation={2} sx={{ padding: 2 }}>
          <DocenteTreeView docentes={docentes} handleClickedItem={handleLastClickedItem} />
        </Paper>
      </Grid2>
      <Grid2 size={{ xs: 12, md: 6 }}>
        <Paper elevation={2} sx={{ padding: 2 }}>
          <DisciplinasTreeView disciplinas={disciplinas} handleClickedItem={handleLastClickedItem} />
        </Paper>
      </Grid2>
      <Grid2 size={{ xs: 12, md: 6 }}>
        <Paper elevation={2} sx={{ padding: 2 }}>
          1
        </Paper>
      </Grid2>
      <Grid2 size={{ xs: 12, md: 6 }}>
        <Paper elevation={2} sx={{ padding: 2 }}>
          2
        </Paper>
      </Grid2>
    </Grid2>
  );
}
