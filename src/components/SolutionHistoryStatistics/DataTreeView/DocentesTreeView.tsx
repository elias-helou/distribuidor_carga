import React from "react";
import { Box, Typography } from "@mui/material";
import { TreeItem } from "@mui/x-tree-view";

interface DocentesTreeViewProps {
  docentesAtribuicoes: Map<string, string[]>; // Map de docentes e suas disciplinas
}

// Componente para exibir a contagem de disciplinas
const DisciplinaCount: React.FC<{ count: number }> = ({ count }) => (
  <Typography component="span" sx={{ marginLeft: 1}} textAlign="right">
    ({count})
  </Typography>
);

const DocentesTreeView: React.FC<DocentesTreeViewProps> = ({ docentesAtribuicoes }) => {
  return (
    <>
      {Array.from(docentesAtribuicoes.entries()).map(([docente, disciplinas]) => (
        <TreeItem
          key={`docente_${docente}`}
          itemId={`docente_${docente}`}
          sx={{maxWidth: "20em"}}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                component="span"
                sx={{
                //   maxWidth: '20em',
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: "100%", // Para ocupar todo o espaço horizontal disponível
                  flexGrow: 1, // Faz o nome do docente crescer e empurrar o contador para a direita
                }}
                title={docente} // Tooltip para mostrar o nome completo ao passar o mouse
              >
                {docente}
              </Typography>
              {/* Contador de disciplinas */}
              <DisciplinaCount count={disciplinas.length} />
            </Box>
          }
        >
          {/* Disciplinas como itens filhos */}
          {disciplinas.map((disciplina) => (
            <TreeItem
              key={`child_docente_${docente}_${disciplina}`}
              itemId={`child_docente_${docente}_${disciplina}`}
              label={disciplina}
            />
          ))}
        </TreeItem>
      ))}
    </>
  );
};

export default DocentesTreeView;
