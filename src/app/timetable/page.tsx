"use client";

import { useGlobalContext } from "@/context/Global";
import {
  Button,
  ButtonGroup,
  createTheme,
  Stack,
  ThemeProvider,
  Typography,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import { getPriorityColor } from ".";
import { Atribuicao, Celula, cloneDeep, TipoTrava } from "@/context/Global/utils";
import { buscaTabu } from "@/algorithms";

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
  const {
    docentes,
    disciplinas,
    formularios,
    atribuicoes,
    setAtribuicoes,
    travas,
    setTravas,
  } = useGlobalContext();

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
      // Se o docente não estiver ativo o loop deve ir para a próxima interação
      if (!docente.ativo) {
        continue;
      }
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
            .indexOf(disciplina.id) != -1 &&
          disciplina.ativo
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

  const setCellColor = (prioridade: number, trava: Celula) => {
    // Verifica se a célula está travada, caso contrário verifica se está atribuida. Caso nenhuma das anteriores seja verdadeia, atribuí a coloração baseada na prioridade.
    if (
      travas.some(
        (obj) =>
          obj.id_disciplina === trava.id_disciplina &&
          obj.nome_docente === trava.nome_docente
      )
    ) {
      return `rgba(224, 224, 224, 0.6)`;
    } else if (
      atribuicoes.some(
        (obj) =>
          obj.id_disciplina == trava.id_disciplina &&
          obj.docentes.some((docente) => docente == trava.nome_docente)
      )
    ) {
      return `rgba(255, 0, 0, 0.4)`;
    } else {
      return getPriorityColor(prioridade, maxPriority);
    }
  };

  /**
   * Adiciona um novo docente a uma disciplina no state de atribuições
   * @param id_disciplina Identificador da disciplina a ser atribuída.
   * @param novo_docente Nome do docente que será atribuído a disciplina.
   */
  const adicionarDocente = (id_disciplina: string, nome_docente: string) => {
    // // Verifica se o estado `atribuicoes` não está vazio
    // if (atribuicoes.length == 0) {
    //   const newAtribuicao: Atribuicao = {
    //     id_disciplina: id_disciplina,
    //     docentes: [nome_docente],
    //   };
    //   setAtribuicoes([...atribuicoes, newAtribuicao]);
    // } else {
    //   setAtribuicoes((prevAtribuicoes) =>
    //     prevAtribuicoes.map((atribuicao) =>
    //       atribuicao.id_disciplina === id_disciplina
    //         ? {
    //             ...atribuicao,
    //             docentes: [...atribuicao.docentes, nome_docente], // Adiciona o novo docente de forma imutável
    //           }
    //         : atribuicao
    //     )
    //   );
    // }

  // Verifica se a disciplina já existe no state
  const disciplina: Atribuicao = atribuicoes.filter(atribuicao => atribuicao.id_disciplina == id_disciplina)[0]
    if(disciplina) {
      setAtribuicoes((prevAtribuicoes) =>
        prevAtribuicoes.map((atribuicao) =>
          atribuicao.id_disciplina === id_disciplina
            ? {
                ...atribuicao,
                docentes: [...atribuicao.docentes, nome_docente], // Adiciona o novo docente de forma imutável
              }
            : atribuicao
        )
      );
    } else {
      // Caso a disciplina ainda não exista no state
      const newAtribuicao: Atribuicao = {id_disciplina: id_disciplina, docentes: [nome_docente]}
      setAtribuicoes([...atribuicoes, newAtribuicao])
    }
  };

  // Remove um docente de uma disciplina no state de atribuições
  const removerDocente = (idDisciplina, docenteARemover) => {
    setAtribuicoes((prevAtribuicoes) =>
      prevAtribuicoes.map((atribuicao) =>
        atribuicao.id_disciplina === idDisciplina
          ? {
              ...atribuicao,
              docentes: atribuicao.docentes.filter(
                (docente) => docente !== docenteARemover
              ), // Remove o docente
            }
          : atribuicao
      )
    );
  };

  const handleCellClick = (event, celula: Celula) => {
    if (event.ctrlKey) {
      if (
        !travas.some((obj) => JSON.stringify(obj) === JSON.stringify(celula))
      ) {
        setTravas([...travas, celula]);
      } else {
        // Verifica o tipo da trava sendo removida, se for a de coluna as células também serão destravadas.
        // Caso a célula tenho sido travada, ela permanescerá travada.
        setTravas([
          ...travas.filter(
            (obj) => JSON.stringify(obj) !== JSON.stringify(celula)
          ),
        ]);
      }
    } else {
      // Procura pelo objeto Atribuição no state pelo id_disciplina
      const newAtribuicao = atribuicoes.find(
        (atribuicao) => atribuicao.id_disciplina == celula.id_disciplina
      );

      // Se o docente ainda não atribuido a disciplina, realizar a inserção, caso contrário remover.
      if (
        !newAtribuicao ||
        (newAtribuicao &&
          !newAtribuicao.docentes.some(
            (docente) => docente == celula.nome_docente
          ))
      ) {

        adicionarDocente(celula.id_disciplina, celula.nome_docente);
      } else {
        removerDocente(celula.id_disciplina, celula.nome_docente);
      }
    }
  };

  const handleColumnClick = (event, trava: Celula) => {
    if (event.ctrlKey) {
      if (
        !travas.some((obj) => JSON.stringify(obj) === JSON.stringify(trava))
      ) {
        // Se a trava for do Tipo Coluna, todas as células devem ser travadas
        if (trava.tipo_trava == TipoTrava.Column) {
          const travar: Celula[] = docentes.map((docente) => ({
            id_disciplina: trava.id_disciplina,
            nome_docente: docente.nome,
            tipo_trava: TipoTrava.ColumnCell,
          }));
          // Adiciona a trava "mãe" no array
          travar.push(trava);

          setTravas([...travas, ...travar]);
        }
      } else {
        // Verifica o tipo da trava sendo removida, se for a de coluna as células também serão destravadas. Caso a célula tenho sido travada, ela permanescerá travada.
        if (trava.tipo_trava == TipoTrava.Column) {
          const newTravas = travas.filter(
            (obj) =>
              (obj.tipo_trava !== TipoTrava.ColumnCell &&
                obj.tipo_trava !== TipoTrava.Column) ||
              obj.id_disciplina != trava.id_disciplina
          );

          setTravas(newTravas);
        }
      }
    }
  };

  const teste = () => {
    // TODO: 15/09/2024 Inserir as atribuições previamente estabelecidas
    const solucao = buscaTabu(cloneDeep(disciplinas), docentes, formularios, travas, 2000, maxPriority+1);
    console.log("Final ---");
    
    console.log(solucao);
  };

  return (
    <ThemeProvider theme={customTheme}>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        {docentes.length > 0 && disciplinas.length > 0 && (
          <TableContainer sx={{ maxHeight: 620 }}>
            <Table
              sx={{ minWidth: 650 }}
              aria-label="sticky table"
              stickyHeader
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      maxWidth: "13rem",
                      position: "sticky",
                      left: 0, // Fixando a célula à esquerda
                      backgroundColor: "white", // Evitando que o fundo fique transparente ao fixar
                      zIndex: 3, // Assegurando que o cabeçalho da célula esteja sobreposto
                      /* display: "flex", justifyContent: "center"*/
                      textAlign: "center",
                    }}
                  >
                    <ButtonGroup variant="outlined" aria-label="Button group">
                      <Button onClick={teste}>
                        <PlayArrowIcon />
                      </Button>
                      <Button
                        onClick={() => {
                          console.log("Pausar processo");
                        }}
                      >
                        <StopIcon />
                      </Button>
                    </ButtonGroup>
                  </TableCell>
                  {disciplinas.map(
                    (disciplina) =>
                      disciplina.ativo && (
                        <TableCell
                          key={disciplina.id}
                          //align="center"
                          onClick={(event) =>
                            handleColumnClick(event, {
                              id_disciplina: disciplina.id,
                              tipo_trava: TipoTrava.Column,
                            })
                          }
                          sx={{ padding: "2px" }}
                          style={{
                            backgroundColor: setCellColor(null, {
                              id_disciplina: disciplina.id,
                            }),
                            textOverflow: "ellipsis",
                            margin: "0",
                          }}
                        >
                          <Stack
                            spacing={1}
                            sx={{ width: "9rem", height: "7rem" }}
                          >
                            <Typography
                              align="left"
                              variant="body1"
                              style={{ fontWeight: "bold", fontSize: "12px" }}
                              noWrap
                              /*TODO: fazer uma fução para isso*/
                              dangerouslySetInnerHTML={{
                                __html: disciplina.cursos
                                  .replace(/^[^;]*;/, "")
                                  .replace(/<br\s*\/?>/gi, "")
                                  .replace(/&emsp;/gi, " "),
                              }}
                            />
                            <Typography
                              align="left"
                              variant="body1"
                              style={{ fontWeight: "bold", fontSize: "13px" }}
                              noWrap
                            >
                              {disciplina.codigo + " " + disciplina.nome}
                            </Typography>
                            <Typography
                              align="left"
                              variant="body1"
                              style={{
                                fontSize: "small" /*minHeight: '5rem'*/,
                              }}
                              noWrap
                              dangerouslySetInnerHTML={{
                                __html: disciplina.horario,
                              }}
                            />
                          </Stack>
                        </TableCell>
                      )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows().map((atribuicao) => (
                  <TableRow key={atribuicao.nome} style={{ maxHeight: "2rem" }}>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        maxWidth: "11rem",
                        position: "sticky",
                        left: 0, // Fixando a célula à esquerda
                        backgroundColor: "white", // Evitando que o fundo fique transparente ao fixar
                        zIndex: 1, // Para manter sobre as demais células,
                        textOverflow: "ellipsis",
                        padding: "5px",
                      }}
                    >
                      <Typography
                        align="left"
                        variant="body2"
                        style={{ fontWeight: "bold" }}
                        noWrap
                      >
                        {atribuicao.nome}
                      </Typography>
                    </TableCell>
                    {atribuicao.prioridades.map(
                      (prioridade) =>
                        disciplinas.find(
                          (disciplina) =>
                            disciplina.id == prioridade.id_disciplina &&
                            disciplina.ativo
                        ) && (
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
                              backgroundColor: setCellColor(
                                prioridade.prioridade,
                                {
                                  nome_docente: atribuicao.nome,
                                  id_disciplina: prioridade.id_disciplina,
                                  tipo_trava: TipoTrava.Cell,
                                }
                              ),
                              padding: "2px",
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
                        )
                    )}
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
