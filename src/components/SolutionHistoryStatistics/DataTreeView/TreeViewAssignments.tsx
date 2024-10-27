import { setCellColor } from "@/app/atribuicoes";
import HeaderCell from "@/app/atribuicoes/components/HeaderCell";
import { Disciplina, HistoricoSolucao } from "@/context/Global/utils";
import { Box, Grid2, Paper, Typography } from "@mui/material";
import React from "react";

// Props do DataTreeView
interface TreeViewAssignmentsProps {
  item: { tipo: string; id: string } | null; // Informação tratada {docente, nome_docente} ou {disciplina, id_disciplina}
  solucao: HistoricoSolucao;
  setHoveredCourese: React.Dispatch<React.SetStateAction<Disciplina>>;
}

const TreeViewAssignments: React.FC<TreeViewAssignmentsProps> = ({
  item,
  solucao,
  setHoveredCourese
}) => {
  const renderAssignments = () => {
    const render = [];

    if (item.tipo === "docente") {
      const docenteAtribuicoes = solucao.solucao.atribuicoes.filter((atribuicao) =>
        atribuicao.docentes.includes(item.id)
      );
      const docenteAtribuicoesDisciplinas: Disciplina[] = [];

      for (const atribuicao of docenteAtribuicoes) {
        const disciplina = solucao.contexto.disciplinas.find(
          (disc) => disc.id === atribuicao.id_disciplina
        );
        docenteAtribuicoesDisciplinas.push(disciplina);
      }

      for (const disciplina of docenteAtribuicoesDisciplinas) {
        const docente = solucao.contexto.docentes.find(
          (docente) =>
            // formulario.id_disciplina === disciplina.id &&
            // formulario.nome_docente === item.id
            docente.formularios.has(disciplina.id) && item.id === docente.nome
        );
        render.push(
          <Grid2 key={`TreeViewAssignments_child_grid_${disciplina.id}`}>
            <HeaderCell
              disciplina={disciplina}
              //onHeaderClick={() => null}
              setHeaderCollor={() => "white"}
              key={`TreeViewAssignments_child_grid_${disciplina.id}_child`}
              setParentHoveredCourse={setHoveredCourese}
            />
            <Box
              sx={{
                backgroundColor: setCellColor(
                  docente ? docente.formularios.get(disciplina.id) : null,
                  { id_disciplina: disciplina.id, nome_docente: item.id },
                  false,
                  solucao.contexto.maxPriority
                ),
                //padding: "2px",
                textAlign: "center",
              }}
            >
              {docente ? docente.formularios.get(disciplina.id) : ""}
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
