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
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import { getPriorityColor } from ".";
import {
  Atribuicao,
  Celula,
  Disciplina,
  processData,
  TipoTrava,
} from "@/context/Global/utils";
import { buscaTabu } from "@/algorithms";
import { useEffect, useRef, useState } from "react";
import { Solucao } from "@/algorithms/utils";
import AlgoritmoDialog from "@/components/AlgorithmDialog";
import { useAlertsContext } from "@/context/Alerts";
import { buscaTabuRefactor } from "@/algorithms/buscaTabu";

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

  /**
   * Dialog - Play Button
   */
  const [openDialog, setOpenDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [interrompe, setInterrompe] = useState(false);

  // Contador de interações
  const [iteracoes, setIteracoes] = useState(0);
  const iteracoesRef = useRef(iteracoes);
  // Usamos useRef para manter uma referência ao valor mais atualizado de "interrompe"
  const interrompeRef = useRef(interrompe);
  const [solucao, setSolucao] = useState<Solucao>({
    avaliacao: 0,
    atribuicoes: [],
  });

  /**
   * Alertas
   */
  const { alertas, setAlertas } = useAlertsContext();

  /**
   * Colorir linha e coluna ao passar o mouse pela célula
   */
  const [hover, setHover] = useState<{
    id_disciplina: string;
    docente: string;
  }>({ docente: "", id_disciplina: "" });

  // Atualizamos o valor de "interrompe" sempre que ele mudar
  useEffect(() => {
    interrompeRef.current = interrompe;
    iteracoesRef.current = iteracoes;
  }, [interrompe, iteracoes]);

  /**
   * Função responsável por gerar as linhas da tabela, criando X espaços de disciplina para cada docente.
   */
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
        (formulario) => formulario.nome_docente == docente.nome
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

  /**
   * Função utilizada para alterar a cor de fundo das disciplinas ou dos docentes quando o mouse passar por uma célula
   * @param docente
   * @returns
   */
  const isHover = (docente: string) => {
    return hover.docente === docente ? `rgba(25, 118, 210, 0.12)` : "white";
  };


  const setHeaderCollor = (id_disciplina: string) => {
    // Verifica se está travado
    if (
      travas.some((obj) => obj.id_disciplina === id_disciplina)
    ) {
      // Verifica se a trava está com hover
      if (id_disciplina === hover.id_disciplina) {
        return `rgba(132, 118, 210, 0.12)`;
      }
      // Caso seja apenas a trava
      return `rgba(224, 224, 224, 0.6)`;
    }else if (id_disciplina === hover.id_disciplina) { // Verifica se está no hover
      return `rgba(25, 118, 210, 0.12)`;
    }  else {
      return "white";
    }
  };

  /**
   * Função que define qual será a cor aplicada para cada célula da tabela.
   * @param {number|null} prioridade - Prioridade dada pelo docente a disciplina, ou nulo em caso de ser o cabeçalho.
   * @param {Celula} celula - Refere-se a célula que está sendo carregada.
   * @returns {string} Retorna um rgba para ser aplicado a propriedade css `background-color`.
   */
  const setCellColor = (prioridade: number | null, celula: Celula) => {
    // Verifica se a célula está travada, caso contrário verifica se está atribuida. Caso nenhuma das anteriores seja verdadeia, atribuí a coloração baseada na prioridade.
    if (
      travas.some(
        (obj) =>
          obj.id_disciplina === celula.id_disciplina &&
          obj.nome_docente === celula.nome_docente
      )
    ) {
      return `rgba(224, 224, 224, 0.6)`;
    } else if (
      atribuicoes.some(
        (obj) =>
          obj.id_disciplina == celula.id_disciplina &&
          obj.docentes.some((docente) => docente == celula.nome_docente)
      )
    ) {
      return `rgba(255, 0, 0, 0.4)`;
    } else if (prioridade) {
      return getPriorityColor(prioridade, maxPriority + 1);
    } else {
      return `rgba(255, 255, 255, 1)`;
    }
  };

  /**
   * Adiciona um novo docente a uma disciplina no state de atribuições
   * @param id_disciplina Identificador da disciplina a ser atribuída.
   * @param novo_docente Nome do docente que será atribuído a disciplina.
   */
  const adicionarDocente = (id_disciplina: string, nome_docente: string) => {
    // Verifica se a disciplina já existe no state
    const disciplina: Atribuicao = atribuicoes.filter(
      (atribuicao) => atribuicao.id_disciplina == id_disciplina
    )[0];
    if (disciplina) {
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
      const newAtribuicao: Atribuicao = {
        id_disciplina: id_disciplina,
        docentes: [nome_docente],
      };
      setAtribuicoes([...atribuicoes, newAtribuicao]);
    }
  };

  /**
   * Função que remove um docente de uma disciplina no state de atribuições
   * @param {string} idDisciplina - Identificador da disciplina a qual terá o docente removido.
   * @param {string} docenteARemover- Nome do docente a ser removido da disciplina.
   */
  const removerDocente = (idDisciplina: string, docenteARemover: string) => {
    setAtribuicoes((prevAtribuicoes) =>
      prevAtribuicoes.map((atribuicao) =>
        atribuicao.id_disciplina == idDisciplina
          ? {
              ...atribuicao,
              docentes: atribuicao.docentes.filter(
                (docente) => docente != docenteARemover
              ), // Remove o docente
            }
          : atribuicao
      )
    );
  };

  /**
   * Função para gerenciar e aplicar corretamente os comportamentos ao clicar em uma célula da tabela.
   * @param event - Evento referente ao clique.
   * @param {Celula} celula - Célula que foi clicada e poderá ter algum comportamento aplicado a ela.
   */
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

  /**
   * Função que gerencia os comportamentos das colunas ao serem clicadas.
   * @param event - Evento referente ao clique.
   * @param {Celula} trava - Coluna que terá o comportamento aplicado.
   */
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

  /**
   * Limpa o state `atribuicoes`, deixando-o vazio.
   */
  const cleanStateAtribuicoes = () => {
    // Varre todo o array e limpa o campo docentes
    const atribuicoesLimpa = atribuicoes.map((atribuicao) => ({
      ...atribuicao, // Mantém os outros campos iguais
      docentes: [], // Limpa o campo docentes
    }));

    // Atualiza o estado com a nova lista de atribuições
    setAtribuicoes(atribuicoesLimpa);
    setAlertas([
      ...alertas,
      {
        id: alertas.length,
        message: "A solução foi limpa com sucesso!",
        type: "success",
      },
    ]);
  };

  /**
   * Função que altera o state e interrompe a execução do algoritmo e adiciona um alerta na fila.
   */
  const interruptExecution = () => {
    setInterrompe(true);
    setAlertas([
      ...alertas,
      {
        id: alertas.length,
        message: "A execução do algoritmo foi interrompida!",
        type: "warning",
      },
    ]);
  };

  /**
   * Executa o algorítmo Busca Tabu
   */
  const executeProcess = async () => {
    //setIteracoes(0);
    handleClickOpenDialog(); // Abre a modal imediatamente
    setProcessing(true); // Aciona o botão de loading

    // p -> Processados
    const { pDisciplinas, pDocentes, pFormularios, pTravas, pAtribuicoes } =
      processData(disciplinas, docentes, formularios, travas, atribuicoes);

    const solucaoObtida = await buscaTabu(
      pDisciplinas,
      pDocentes,
      pFormularios,
      pTravas,
      pAtribuicoes,
      150,
      maxPriority + 1,
      () => interrompeRef.current,
      setIteracoes
    ); // Executa a busca tabu
    if (!interrompeRef.current) {
      setAlertas([
        ...alertas,
        { id: alertas.length, message: "Execução finalizada.", type: "info" },
      ]);
    }
    console.log(solucaoObtida);
    setSolucao(solucaoObtida); // Atribui a solução encontrada no state local.

    setProcessing(false); // Encerra o processamento
    setInterrompe(false); // Altera o state da flag de interupção para falso
    setIteracoes(0);
  };

  const executeProcess2 = async () => {
    // p -> Processados
      const solucaoRefactor = await buscaTabuRefactor(docentes, disciplinas, atribuicoes, 10, 5, maxPriority + 1)

      console.log(solucaoRefactor)
  }

  /**
   * Função que agrupa processos ao abrir o `Dialog`
   */
  const handleClickOpenDialog = () => {
    setOpenDialog(true);
  };

  /**
   * Função que agrupa processos ao fechar o `Dialog`
   */
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  /**
   * Aplica a solução encontrada pelo algorítmo no state global `atribuicoes`.
   */
  const applySolutionToState = () => {
    if (atribuicoes.length == solucao.atribuicoes.length) {
      setAtribuicoes(solucao.atribuicoes);
    } else {
      for (const newAtribuicao of solucao.atribuicoes) {
        setAtribuicoes((prevAtribuicoes) =>
          prevAtribuicoes.map((atribuicao) =>
            atribuicao.id_disciplina === newAtribuicao.id_disciplina
              ? {
                  ...atribuicao,
                  docentes: [...atribuicao.docentes, ...newAtribuicao.docentes], // Adiciona os novos docentes corretamente
                }
              : { ...atribuicao, docentes: [] }
          )
        );
      }
    }
  };

  /**
   * Processos referentes a aplicação da solução obtida pelo algoritmo ao state global.
   */
  const applySolution = () => {
    applySolutionToState();
    setAlertas([
      ...alertas,
      {
        id: alertas.length,
        message: "A solução foi aplicada com sucesso!",
        type: "success",
      },
    ]);
    handleCloseDialog();
  };

  /**
   * Cria o bloco referente aos horários de um adisicplina
   * @param disciplina Disciplina contendo os horários
   * @returns Componente React com os horários.
   */
  const createHorariosblock = (disciplina: Disciplina): React.ReactNode => {
    // Verifica se há horários definidos para a disciplina
    if (disciplina.horarios.length > 0) {
      return (
        <Typography
          align="left"
          variant="body1"
          style={{
            fontSize: "small",
            whiteSpace: "pre-wrap", // Permite quebra de linha para o layout
          }}
        >
          Horário:
          {disciplina.horarios.map((horario, index) =>
            horario ? (
              <span key={`${disciplina.nome}-${index}`}>
                <br />
                &emsp;{horario.dia} {horario.inicio}/{horario.fim}
              </span>
            ) : null
          )}
        </Typography>
      );
    }

    // Caso não haja horários definidos, exibe "A definir"
    return (
      <Typography
        align="left"
        variant="body1"
        style={{
          fontSize: "small",
        }}
      >
        Horário:
        <br />
        &emsp;A definir
      </Typography>
    );
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
                      <Button onClick={executeProcess2}>
                        <PlayArrowIcon />
                      </Button>
                      <Button onClick={cleanStateAtribuicoes}>
                        <CleaningServicesIcon />
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
                          sx={{
                            padding: "2px",
                          }}
                          style={{
                            backgroundColor: setHeaderCollor(disciplina.id),
                            textOverflow: "ellipsis",
                            margin: "0",
                            minWidth: "12rem",
                            maxWidth: "12rem",
                          }}
                        >
                          <Stack
                            spacing={1}
                            sx={{ /*maxWidth: "9rem",*/ height: "7rem" }}
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
                            {createHorariosblock(disciplina)}
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
                        backgroundColor: isHover(atribuicao.nome), // Evitando que o fundo fique transparente ao fixar
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
                            onMouseEnter={() =>
                              setHover({
                                docente: atribuicao.nome,
                                id_disciplina: prioridade.id_disciplina,
                              })
                            }
                            onMouseLeave={() =>
                              setHover({ docente: "", id_disciplina: "" })
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
      <AlgoritmoDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onApply={applySolution}
        onStop={() => interruptExecution()}
        processing={processing}
        itearions={iteracoesRef.current}
      />
    </ThemeProvider>
  );
}
