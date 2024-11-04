import {
  TreeDisciplina,
  TreeDocente,
} from "@/app/history/components/SolutionHistoryStatistics";
import { Grid2, Paper } from "@mui/material";
import DocenteTreeView from "./DocenteTreeView";
import DisciplinasTreeView from "./DisciplinasTreeView";

export interface DataTreeViewProps {
  docentes: Map<string, TreeDocente>;
  disciplinas: Map<string, TreeDisciplina>;
}

export default function NewDataTreeView({
  docentes,
  disciplinas,
}: DataTreeViewProps) {
  return (
    <Grid2 container size={{ xs: 12 }} spacing={2}>
      <Grid2 size={{ xs: 12, md: 6 }}>
        <Paper elevation={2} sx={{ padding: 2 }}>
          <DocenteTreeView docentes={docentes} />
        </Paper>
      </Grid2>
      <Grid2 size={{ xs: 12, md: 6 }}>
        <Paper elevation={2} sx={{ padding: 2 }}>
          <DisciplinasTreeView disciplinas={disciplinas} />
        </Paper>
      </Grid2>
    </Grid2>
  );
}
