import { setCellColor } from "@/app/timetable";
import HeaderCell from "@/app/timetable/components/HeaderCell";
import { useGlobalContext } from "@/context/Global";
import { Disciplina } from "@/context/Global/utils";
import { Box, Grid2, Paper, Typography } from "@mui/material";
import React from "react";

// Props do DataTreeView
interface TreeViewAssignmentsProps {
  item: { tipo: string; id: string } | null; // Informação tratada {docente, nome_docente} ou {disciplina, id_disciplina}
  maxPriority: number;
}

const TreeViewAssignments: React.FC<TreeViewAssignmentsProps> = ({
  item,
  maxPriority,
}) => {
  const { formularios, atribuicoes, disciplinas } = useGlobalContext();

  const renderAssignments = () => {
    const render = [];

    if (item.tipo === "docente") {
      const docenteAtribuicoes = atribuicoes.filter((atribuicao) =>
        atribuicao.docentes.includes(item.id)
      );
      const docenteAtribuicoesDisciplinas: Disciplina[] = [];

      for (const atribuicao of docenteAtribuicoes) {
        const disciplina = disciplinas.find(
          (disc) => disc.id === atribuicao.id_disciplina
        );
        docenteAtribuicoesDisciplinas.push(disciplina);
      }

      for (const disciplina of docenteAtribuicoesDisciplinas) {
        const formulario = formularios.find(
          (formulario) =>
            formulario.id_disciplina === disciplina.id &&
            formulario.nome_docente === item.id
        );
        render.push(
          <Grid2 key={`TreeViewAssignments_child_grid_${disciplina.id}`}>
            <HeaderCell
              disciplina={disciplina}
              //onHeaderClick={() => null}
              setHeaderCollor={() => "white"}
              key={`TreeViewAssignments_child_grid_${disciplina.id}_child`}
            />
            <Box
              sx={{
                backgroundColor: setCellColor(
                  formulario ? formulario.prioridade : null,
                  { id_disciplina: disciplina.id, nome_docente: item.id },
                  false,
                  maxPriority
                ),
                //padding: "2px",
                textAlign: "center",
              }}
            >
              {formulario ? formulario.prioridade : ""}
            </Box>
          </Grid2>
        );
      }
    }

    return render;
  };

  return (
    <Paper
      elevation={2}
      sx={{
        height: "25em",
        overflowY: "auto", // Habilita o scroll vertical
        display: 'flex'
      }}
    >
      <Grid2
        container
        spacing={2}
        size={{ xs: 8 }}
        alignItems="center"
        justifyContent="center"
        sx={{ width: "100%" }}
        key={'TreeViewAssignments_container_grid'}
      >
        {!item && (
          <Grid2 alignItems="center" justifyContent="center" key={'TreeViewAssignments_no_info_grid'}>
            <Typography variant="h6" color="error" align="center">
              Nenhuma informação selecionada!
            </Typography>
          </Grid2>
        )}
        {item && renderAssignments()}
      </Grid2>
    </Paper>
  );
};

export default TreeViewAssignments;
