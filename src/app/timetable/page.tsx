"use client";

import { TipoTrava, Trava, useGlobalContext } from "@/context/Global";
import { createTheme, ThemeProvider, Typography } from "@mui/material";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { styled } from "@mui/material/styles";

// Customizar todos os TableCell
const customTheme = createTheme({
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(224, 224, 224, 1)", // Borda aplicada a todas as células
        },
      },
    },
  },
});

export default function Timetable() {
  const { docentes, disciplinas, atribuicoes, formularios, travas, setTravas } =
    useGlobalContext();

  let maxPriority = 0;

  // TODO: Arrumar tipagens
  const rows = (): {
    nome: string;
    prioridades: { id_disciplina: string; prioridade: number }[];
  }[] => {
    const newRows: {
      nome: string;
      prioridades: { id_disciplina: string; prioridade: number }[];
    }[] = [];

    for (const docente of docentes) {
      const newDocente: {
        nome: string;
        prioridades: { id_disciplina: string; prioridade: number }[];
      } = { nome: docente.nome, prioridades: [] };
      const docenteDisciplinas = formularios.filter(
        (formulario) => formulario.nome_professor == docente.nome
      );

      for (const disciplina of disciplinas) {
        if (
          docenteDisciplinas
            .map((dd) => dd.id_disciplina)
            .indexOf(disciplina.id) != -1
        ) {
          const prioridade = docenteDisciplinas.filter(
            (dd) => dd.id_disciplina == disciplina.id
          )[0].prioridade;
          newDocente.prioridades.push({
            id_disciplina: disciplina.id,
            prioridade: prioridade,
          });

          if (prioridade > maxPriority) {
            maxPriority = prioridade;
          }
        } else {
          newDocente.prioridades.push({
            id_disciplina: disciplina.id,
            prioridade: null,
          });
        }
      }
      newRows.push(newDocente);
    }

    return newRows;
  };

  // Função que define a colocação da célula na tabela
  const getPriorityColor = (priority: number): string => {
    // Se a prioridade for null ou undefined, não altera a cor
    if (priority === null || priority === undefined) {
      return "inherit"; // 'inherit' mantém a cor original do elemento
    }

    // Define os componentes RGB da cor base (rgb(118, 196, 188))
    const baseRed = 118;
    const baseGreen = 196;
    const baseBlue = 188;

    // Variação mínima e máxima para intensificar ou clarear a cor
    const minFactor = 0.6; // Fator de escurecimento máximo (mais escuro)
    const maxFactor = 1.8; // Fator de clareamento máximo (mais claro)

    // Calcula o fator de ajuste da cor com base na prioridade
    const factor =
      maxFactor -
      ((priority - 1) / (maxPriority - 1)) * (maxFactor - minFactor);

    // Aplica o fator de ajuste aos componentes RGB
    const red = Math.floor(baseRed * factor);
    const green = Math.floor(baseGreen * factor);
    const blue = Math.floor(baseBlue * factor);

    // Retorna a cor ajustada em RGB
    return `rgb(${red}, ${green}, ${blue})`;
  };

  const setCellColor = (prioridade: number, trava: Trava) => {
    if (
      travas.some(
        (obj) =>
          obj.id_disciplina === trava.id_disciplina &&
          obj.nome_docente === trava.nome_docente
      )
    ) {
      return `rgba(224, 224, 224, 1)`;
    } else {
      return getPriorityColor(prioridade);
    }
  };

  // Função para lidar com o clique nas células e travar caso Ctrl estiver pressionado
  const handleCellClick = (event, trava: Trava) => {
    if (event.ctrlKey) {
      if (
        !travas.some((obj) => JSON.stringify(obj) === JSON.stringify(trava))
      ) {
        // Se a trava for do Tipo Coluna, todas as células devem ser travadas
        if (trava.tipo_trava == TipoTrava.Column) {
          const travar: Trava[] = docentes.map((docente) => ({
            id_disciplina: trava.id_disciplina,
            nome_docente: docente.nome,
            tipo_trava: TipoTrava.ColumnCell,
          }));
          // Adiciona a trava "mãe" no array
          travar.push(trava);

          setTravas([...travas, ...travar]);
        } else {
          setTravas([...travas, trava]);
        }
      } else {
        // Verifica o tipo da trava sendo removida, se for a de coluna as células também serão destravadas. Caso a célula tenho sido travada, ela permanescerá travada.
        if (trava.tipo_trava == TipoTrava.Column) {
          const newTravas = travas.filter(
            (obj) => (obj.tipo_trava !== TipoTrava.ColumnCell && obj.tipo_trava !== TipoTrava.Column || obj.id_disciplina != trava.id_disciplina)
          );

          setTravas(newTravas);
        } else {
          setTravas([
            ...travas.filter(
              (obj) => JSON.stringify(obj) !== JSON.stringify(trava)
            ),
          ]);
        }
      }
    }
  };

  return (
    <ThemeProvider theme={customTheme}>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        {docentes.length > 0 && disciplinas.length > 0 && (
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table
              sx={{ minWidth: 650 }}
              aria-label="sticky table"
              stickyHeader
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: "15rem" }}>Botões</TableCell>
                  {disciplinas.map((disciplina) => (
                    <TableCell
                      key={disciplina.id}
                      align="center"
                      onClick={(event) =>
                        handleCellClick(event, {
                          id_disciplina: disciplina.id,
                          tipo_trava: TipoTrava.Column,
                        })
                      }
                      style={{
                          backgroundColor: setCellColor(null, {id_disciplina: disciplina.id}),
                        }}
                    >
                      {disciplina.id}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows().map((atribuicao) => (
                  <TableRow key={atribuicao.nome}>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ minWidth: "15rem" }}
                    >
                      <Typography
                        align="left"
                        variant="body2"
                        style={{ fontWeight: "bold" }}
                      >
                        {atribuicao.nome}
                      </Typography>
                    </TableCell>
                    {atribuicao.prioridades.map((prioridade) => (
                      <TableCell
                        key={
                          atribuicao.nome +
                          "_" +
                          prioridade +
                          "_" +
                          prioridade.id_disciplina
                        }
                        align="center"
                        style={{
                          backgroundColor: setCellColor(prioridade.prioridade, {
                            nome_docente: atribuicao.nome,
                            id_disciplina: prioridade.id_disciplina,
                            tipo_trava: TipoTrava.Cell,
                          }),
                        }}
                        onClick={(event) =>
                          handleCellClick(event, {
                            nome_docente: atribuicao.nome,
                            id_disciplina: prioridade.id_disciplina,
                            tipo_trava: TipoTrava.Cell,
                          })
                        }
                      >
                        {prioridade.prioridade}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </ThemeProvider>
  );
}
