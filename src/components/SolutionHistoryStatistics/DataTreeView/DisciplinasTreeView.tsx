import React from "react";
import { TreeItem } from "@mui/x-tree-view";

interface DisciplinasTreeViewProps {
  disciplinas: Map<string, string[]>,
  // atribuicoes: {
  //   id_disciplina: string;
  //   docentes: string[];
  // }[]; // Array de atribuições (disciplinas e seus docentes)
}

const DisciplinasTreeView: React.FC<DisciplinasTreeViewProps> = ({ disciplinas }) => {
  return (
    <>
      {Array.from(disciplinas.entries()).map(([disciplina, docentes]) => (
        <TreeItem
          key={`disciplona_${disciplina}`}
          itemId={`disciplona_${disciplina}`}
          label={`${disciplina} (${docentes.length})`}
        >
          {docentes.map((docente) => (
            <TreeItem
              key={`child_disciplina_${disciplina}_${docente}`}
              itemId={`child_disciplina_${disciplina}_${docente}`}
              label={docente}
            />
          ))}
        </TreeItem>
      ))}
    </>
  );
};

export default DisciplinasTreeView;
