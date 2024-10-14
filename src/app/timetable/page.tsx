"use client";

import { useGlobalContext } from "@/context/Global";
import {
  createTheme,
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
import { exportJson, getFormattedDate, getPriorityColor, saveAtribuicoesInHistoryState } from ".";
import {
  Atribuicao,
  Celula,
  ContextoExecucao,
  processData,
  TipoInsercao,
  TipoTrava,
} from "@/context/Global/utils";
//import { buscaTabu } from "@/algorithms";
import { useEffect, useRef, useState } from "react";
import AlgoritmoDialog from "@/components/AlgorithmDialog";
import { useAlertsContext } from "@/context/Alerts";
import { avaliarSolucao, buscaTabuRefactor } from "@/algorithms/buscaTabu";
import ButtonGroupHeader from "./components/ButtonGroupHeader";
import HeaderCell from "./components/HeaderCell";
import { addNewSolutionToHistory, updateSolutionId } from "@/context/SolutionHistory/utils";

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
    solucaoAtual,
    setSolucaoAtual,
    historicoSolucoes,
    setHistoricoSolucoes,
    updateAtribuicoes
  } = useGlobalContext();

  let maxPriority = 0;

  /**
   * Dialog - Play Button
   */
  const [openDialog, setOpenDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [interrompe, setInterrompe] = useState(false);

  // Disciplinas atribuidas na execução do algoritmo
  const [disciplinasAlocadas, setDisciplinasAlocadas] = useState(0);
  const disciplinasAlocadasRef = useRef(disciplinasAlocadas);
  
  // Usamos useRef para manter uma referência ao valor mais atualizado de "interrompe"
  const interrompeRef = useRef(interrompe);

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
    disciplinasAlocadasRef.current = disciplinasAlocadas;
  }, [interrompe, disciplinasAlocadas]);

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

  const setHeaderCollor = (id_disciplina: string) => {
    // Verifica se está travado
    if (
      travas.some((obj) => obj.id_disciplina === id_disciplina && obj.tipo_trava === TipoTrava.Column)
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

  const setColumnCollor = (nome_docente: string) => {
    // Verifica se está travado
    if (
      travas.some((obj) => obj.nome_docente === nome_docente && obj.tipo_trava === TipoTrava.Row)
    ) {
      // Verifica se a trava está com hover
      if (nome_docente === hover.docente) {
        return `rgba(132, 118, 210, 0.12)`;
      }
      // Caso seja apenas a trava
      return `rgba(224, 224, 224, 0.6)`;
    }else if (nome_docente === hover.docente) { // Verifica se está no hover
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

      if(atribuicoes.some(
        (obj) =>
          obj.id_disciplina == celula.id_disciplina &&
          obj.docentes.some((docente) => docente == celula.nome_docente)
      )) {
        return `rgba(182, 44, 44, 0.4)`
      }
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

      // /**
      //  * Caso alguma atribuição for alterada e esse contunto já fizer parte do histórico de soluções,
      //  * o identificador da solução deve ser removido.
      //  */
      // if(solucaoAtual.idHistorico !== undefined) {
      //   setSolucaoAtual((prev) => ({...prev, idHistorico: undefined}))
      // }
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

    const handleRowClick = (event, trava: Celula) => {
    if (event.ctrlKey) {      
      if (
        !travas.some((obj) => JSON.stringify(obj) === JSON.stringify(trava))
      ) {
        // Se a trava for do Tipo Coluna, todas as células devem ser travadas
        if (trava.tipo_trava == TipoTrava.Row) {
          const travar: Celula[] = disciplinas.map((disciplina) => ({
            id_disciplina: disciplina.id,
            nome_docente: trava.nome_docente,
            tipo_trava: TipoTrava.RowCell,
          }));
          // Adiciona a trava "mãe" no array
          travar.push(trava);

          setTravas([...travas, ...travar]);
        }
      } else {
        // Verifica o tipo da trava sendo removida, se for a de coluna as células também serão destravadas. Caso a célula tenho sido travada, ela permanescerá travada.
        if (trava.tipo_trava == TipoTrava.Row) {
          const newTravas = travas.filter(
            (obj) =>
              (obj.tipo_trava !== TipoTrava.RowCell &&
                obj.tipo_trava !== TipoTrava.Row) ||
              obj.nome_docente != trava.nome_docente
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

    // Varre todo o array e limpa o campo docentes caso não esteja travdo
    const atribuicoesLimpa = atribuicoes.map(atribuicao => {
      if(travas.find(trava => trava.id_disciplina === atribuicao.id_disciplina && atribuicao.docentes.includes(trava.nome_docente)) 
        || !disciplinas.find(disciplina => disciplina.id === atribuicao.id_disciplina)?.ativo
        || !docentes.find(docente => atribuicao.docentes.includes(docente.nome))?.ativo 
    ) {
        return atribuicao
      }
      return {
          ...atribuicao, // Mantém os outros campos iguais
          docentes: [], // Limpa o campo docentes
        }
      
    })

    // /**
    //    * Caso alguma atribuição for alterada e esse contunto já fizer parte do histórico de soluções,
    //    * o identificador da solução deve ser removido.
    //    */
    //   if(solucaoAtual.idHistorico !== undefined) {
    //     setSolucaoAtual((prev) => ({...prev, idHistorico: undefined}))
    //   }

    // Atualiza o estado com a nova lista de atribuições
    setAtribuicoes(atribuicoesLimpa);
    setAlertas([
      ...alertas,
      {
        id: new Date().getTime(),
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
        id: new Date().getTime(),
        message: "A execução do algoritmo foi interrompida!",
        type: "warning",
      },
    ]);
  };

  /**
   * Executa o algorítmo Busca Tabu
   */
  const executeProcess2 = async () => {
    handleClickOpenDialog(); // Abre a modal imediatamente
    setProcessing(true); // Aciona o botão de loading
    // p -> Processados
      const { pDisciplinas, pDocentes, pFormularios, pTravas, pAtribuicoes } =
      processData(disciplinas, docentes, formularios, travas, atribuicoes);
      
      const solucaoRefactor = await buscaTabuRefactor(pDisciplinas, pDocentes, pFormularios, pTravas, pAtribuicoes, 10, maxPriority + 1, () => interrompeRef.current, setDisciplinasAlocadas)

      console.log("Solução:")
      console.log(solucaoRefactor)
      setSolucaoAtual(solucaoRefactor); // Atribui a solução encontrada no state local.

      setProcessing(false); // Encerra o processamento
      setInterrompe(false); // Altera o state da flag de interupção para falso
      setDisciplinasAlocadas(0);
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
  const ApplySolutionToState = () => {
      /**
       * Adiciona ao histórico de soluções
       */
      const contextoExecucao: ContextoExecucao = {disciplinas: [...disciplinas], docentes: [...docentes], travas: [...travas]}
      const idSolucao: string = addNewSolutionToHistory(solucaoAtual, setHistoricoSolucoes, historicoSolucoes, TipoInsercao.Algoritmo, contextoExecucao);
      updateSolutionId(setSolucaoAtual, idSolucao)
      /**
       * Atualiza as atribuições
       */
      updateAtribuicoes(solucaoAtual.atribuicoes)
   };

  /**
   * Processos referentes a aplicação da solução obtida pelo algoritmo ao state global.
   */
  const applySolution = () => {
    ApplySolutionToState();
    setAlertas([
      ...alertas,
      {
        id: new Date().getTime(),
        message: "A solução foi aplicada com sucesso!",
        type: "success",
      },
    ]);
    handleCloseDialog();
  };

  const saveAlterations = () => {
    const { pDisciplinas, pDocentes, pAtribuicoes } =
      processData(disciplinas, docentes, formularios, travas, atribuicoes);

    const avaliacao = avaliarSolucao(pAtribuicoes, pDocentes, pDisciplinas ,maxPriority+1);
    const contextoExecucao: ContextoExecucao = {disciplinas: [...disciplinas], docentes: [...docentes], travas: [...travas]}
    saveAtribuicoesInHistoryState(atribuicoes, avaliacao, historicoSolucoes, setHistoricoSolucoes, setSolucaoAtual, contextoExecucao)

    setAlertas([
      ...alertas,
      {
        id: new Date().getTime(),
        message: "As atribuições foram adicionadas ao histórico!",
        type: "success",
      },
    ]);
  }

  /**
   * Remover depois que for feita a tela de Histórico de execuções
   */
  const downalodJson = () => {
    if(!atribuicoes.some(atribuicao => atribuicao.docentes.length > 0)) {
        setAlertas([
        ...alertas,
        {
          id: new Date().getTime(),
          message: "Nenhuma atribuição foi realizada!",
          type: "warning",
        },
      ]);
    }
    const filename = getFormattedDate() + '.json'

    exportJson(filename, docentes, disciplinas, atribuicoes)
  }

  return (
    <ThemeProvider theme={customTheme}>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        {docentes.length > 0 && disciplinas.length > 0 && (
          <TableContainer sx={{ maxHeight: '48rem' }}>
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
                      textAlign: "center",
                    }}
                  >
                    <ButtonGroupHeader key="button_group_timetabling" onExecute={executeProcess2} onClean={cleanStateAtribuicoes} download={downalodJson} saveAlterations={saveAlterations}/>
                  </TableCell>
                  {disciplinas.map(
                    (disciplina) =>
                      disciplina.ativo && (
                        <HeaderCell 
                          key={disciplina.id} 
                          disciplina={disciplina} 
                          onHeaderClick={(e) => handleColumnClick(e, {id_disciplina: disciplina.id, tipo_trava: TipoTrava.Column})} 
                          setHeaderCollor={setHeaderCollor}
                        />
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
                        backgroundColor: 'white', // Evitando que o fundo fique transparente ao fixar
                        zIndex: 1, // Para manter sobre as demais células,
                        textOverflow: "ellipsis",
                        padding: 0,
                      }}
                      onClick={(e) => handleRowClick(e, {nome_docente: atribuicao.nome, tipo_trava: TipoTrava.Row})}
                    >
                      <Typography
                        align="left"
                        variant="body2"
                        sx={{ fontWeight: "bold",  backgroundColor: setColumnCollor(atribuicao.nome), padding: '3px'}}
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
                {/* {docentes.map(docente => ( docente.ativo &&
                  (
                    <ColumnCell 
                      key={docente.nome}
                      atribuicoes={atribuicoes}
                      disciplinas={disciplinas.filter(disciplina => disciplina.ativo)}
                      docente={docente}
                      travas={travas}
                      setHover={setHover}
                      setColumnCollor={isHover}
                      onColumnClick={() => console.log('Travar')}
                      handleCellClick={handleCellClick}
                      maxPriority={maxPriority + 1}
                    />
                  )
                ))} */}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      {openDialog && <AlgoritmoDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onApply={applySolution}
        onStop={() => interruptExecution()}
        processing={processing}
        progress={{current: disciplinasAlocadasRef.current, total: disciplinas.filter(disciplina => disciplina.ativo).length}}
      />}
    </ThemeProvider>
  );
}
