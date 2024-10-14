import React from "react";
import { Paper } from "@mui/material";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import DocentesTreeView from "./DocentesTreeView";
import DisciplinasTreeView from "./DisciplinasTreeView";

// Props do DataTreeView
interface DataTreeViewProps {
  docentes: Map<string, string[]>; // Map de docentes e suas disciplinas
  // atribuicoes: {
  //   id_disciplina: string;
  //   docentes: string[];
  // }[]; // Array de atribuições (disciplinas e seus docentes)
  disciplinas: Map<string, string[]>
}

const DataTreeView: React.FC<DataTreeViewProps> = ({ docentes, disciplinas }) => {
  return (
    <Paper
      sx={{
        height: "25em",
        maxWidth: "23em",
        overflowY: "auto", // Habilita o scroll vertical
      }}
      elevation={2}
    >
      <SimpleTreeView sx={{width: "21em"}}>
        <TreeItem itemId="grid_Docentes" label={`Docentes (${docentes.size})`}>
          <DocentesTreeView docentesAtribuicoes={docentes} />
        </TreeItem>
        <TreeItem itemId="grid_Disciplinas" label={`Disciplinas (${disciplinas.size})`}>
          <DisciplinasTreeView disciplinas={disciplinas} />
        </TreeItem>
      </SimpleTreeView>
    </Paper>
  );
};

export default DataTreeView;
