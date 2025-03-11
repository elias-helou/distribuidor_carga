"use client";

import { useGlobalContext } from "@/context/Global";
import { createTheme, ThemeProvider, Typography } from "@mui/material";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import {
  exportJson,
  getFormattedDate,
  getPriorityColor,
  saveAtribuicoesInHistoryState,
} from ".";
import {
  Atribuicao,
  Celula,
  ContextoExecucao,
  Disciplina,
  Solucao,
  TipoInsercao,
  TipoTrava,
} from "@/context/Global/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import AlgoritmoDialog from "@/components/AlgorithmDialog";
import { useAlertsContext } from "@/context/Alerts";
import ButtonGroupHeader from "./components/ButtonGroupHeader";
import HeaderCell from "./components/HeaderCell";
import {
  addNewSolutionToHistory,
  updateSolutionId,
} from "@/context/SolutionHistory/utils";
import HoveredCourse from "./components/HoveredCourse";
import { useSolutionHistory } from "@/context/SolutionHistory/hooks";
import CleanAlertDialog from "./components/CleanAlertDialog";
import { useAlgorithmContext } from "@/context/Algorithm";
import { TabuSearch } from "@/TabuSearch/Classes/TabuSearch";

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
    updateAtribuicoes,
    parametros,
  } = useGlobalContext();

  const {
    hardConstraints,
    softConstraints,
    neighborhoodFunctions,
    stopFunctions,
    aspirationFunctions,
  } = useAlgorithmContext();

  const { cleanSolucaoAtual } = useSolutionHistory();

  let maxPriority = 0;

  /**
   * Dialog - Play Button
   */
  const [openDialog, setOpenDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [interrompe, setInterrompe] = useState(false);
  const [openCleanDialog, setOpenCleanDialog] = useState(false);

  // Disciplinas atribuidas na execução do algoritmo
  const [disciplinasAlocadas, setDisciplinasAlocadas] = useState(0);
  const disciplinasAlocadasRef = useRef(disciplinasAlocadas);

  // Usamos useRef para manter uma referência ao valor mais atualizado de "interrompe"
  const interrompeRef = useRef(interrompe);

  /**
   * Alertas
   */
  const { addAlerta } = useAlertsContext();

  /**
   * Colorir linha e coluna ao passar o mouse pela célula
   */
  const [hover, setHover] = useState<{
    id_disciplina: string;
    docente: string;
  }>({ docente: "", id_disciplina: "" });

  /**
   * State para controlar o hover nos filhos do table header a fim de exibir o componenete HoveredCourese
   */
  const [hoveredCourese, setHoveredCourese] = useState<Disciplina | null>(null);

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
      travas.some(
        (obj) =>
          obj.id_disciplina === id_disciplina &&
          obj.tipo_trava === TipoTrava.Column
      )
    ) {
      // Verifica se a trava está com hover
      if (id_disciplina === hover.id_disciplina) {
        return `rgba(132, 118, 210, 0.12)`;
      }
      // Caso seja apenas a trava
      return `rgba(224, 224, 224, 0.6)`;
    } else if (id_disciplina === hover.id_disciplina) {
      // Verifica se está no hover
      return `rgba(25, 118, 210, 0.12)`;
    } else {
      return "white";
    }
  };

  const setColumnCollor = (nome_docente: string) => {
    // Verifica se está travado
    if (
      travas.some(
        (obj) =>
          obj.nome_docente === nome_docente && obj.tipo_trava === TipoTrava.Row
      )
    ) {
      // Verifica se a trava está com hover
      if (nome_docente === hover.docente) {
        // Travado Hover e Conflito
        if (verificaConflitosDocente(nome_docente)) {
          return `rgba(255, 118, 210, 0.30)`;
        }
        return `rgba(132, 118, 210, 0.12)`;
      }

      // Travado e conflito
      if (verificaConflitosDocente(nome_docente)) {
        return `rgba(255, 200, 200, 1)`;
      }
      // Caso seja apenas a trava
      return `rgba(224, 224, 224, 0.6)`;
    } else if (nome_docente === hover.docente) {
      // Hover Conflito
      if (verificaConflitosDocente(nome_docente)) {
        return `rgba(255, 110, 200, 0.60)`;
      }
      // Verifica se está no hover
      return `rgba(25, 118, 210, 0.12)`;
    } else {
      // Conflito
      if (verificaConflitosDocente(nome_docente)) {
        return `rgba(255, 0, 0, 0.5)`;
      }
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
      if (
        atribuicoes.some(
          (obj) =>
            obj.id_disciplina == celula.id_disciplina &&
            obj.docentes.some((docente) => docente == celula.nome_docente)
        )
      ) {
        return `rgba(182, 44, 44, 0.4)`;
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
  const adicionarDocente = useCallback(
    (id_disciplina: string, nome_docente: string) => {
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
    },
    [atribuicoes, setAtribuicoes]
  );

  /**
   * Função que remove um docente de uma disciplina no state de atribuições
   * @param {string} idDisciplina - Identificador da disciplina a qual terá o docente removido.
   * @param {string} docenteARemover- Nome do docente a ser removido da disciplina.
   */
  const removerDocente = useCallback(
    (idDisciplina: string, docenteARemover: string) => {
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
    },
    [setAtribuicoes]
  );

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
      // Se tiver trava não fazer nada
      if (
        !travas.some(
          (trava) =>
            trava.id_disciplina === celula.id_disciplina &&
            trava.nome_docente === celula.nome_docente
        )
      ) {
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
    }

    cleanSolucaoAtual(); // Limpa a solução atual
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
      cleanSolucaoAtual(); // Limpa a solução atual
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

      cleanSolucaoAtual(); // Limpa a solução atual
    }
  };

  /**
   * Limpa o state `atribuicoes`, deixando-o vazio.
   */
  const cleanStateAtribuicoes = () => {
    // Varre todo o array e limpa o campo docentes caso não esteja travdo
    const atribuicoesLimpa = atribuicoes.map((atribuicao) => {
      if (
        travas.find(
          (trava) =>
            trava.id_disciplina === atribuicao.id_disciplina &&
            atribuicao.docentes.includes(trava.nome_docente)
        ) ||
        !disciplinas.find(
          (disciplina) => disciplina.id === atribuicao.id_disciplina
        )?.ativo ||
        !docentes.find((docente) => atribuicao.docentes.includes(docente.nome))
          ?.ativo
      ) {
        return atribuicao;
      }
      return {
        ...atribuicao, // Mantém os outros campos iguais
        docentes: [], // Limpa o campo docentes
      };
    });

    // Atualiza o estado com a nova lista de atribuições
    setAtribuicoes(atribuicoesLimpa);
    addAlerta("A solução foi limpa com sucesso!", "success");
    setOpenCleanDialog(false);
  };

  /**
   * Função que altera o state e interrompe a execução do algoritmo e adiciona um alerta na fila.
   */
  const interruptExecution = () => {
    setInterrompe(true);
    addAlerta("A execução do algoritmo foi interrompida!", "warning");
  };

  /**
   * Executa o algorítmo Busca Tabu
   */
  const executeProcess = async () => {
    handleClickOpenDialog(); // Abre a modal imediatamente
    setProcessing(true); // Aciona o botão de loading
    //p -> Processados
    // const { pDisciplinas, pDocentes, pFormularios, pTravas, pAtribuicoes } =
    //   processData(disciplinas, docentes, formularios, travas, atribuicoes);

    // const solucao = await buscaTabu(
    //   pDisciplinas,
    //   pDocentes,
    //   pFormularios,
    //   pTravas,
    //   pAtribuicoes,
    //   5,
    //   maxPriority + 1,
    //   () => interrompeRef.current,
    //   setDisciplinasAlocadas,
    //   parametros,
    //   { hard: hardConstraints, soft: softConstraints }
    // );

    // // console.log("Solução:");
    // // console.log(solucao);
    // setSolucaoAtual(solucao); // Atribui a solução encontrada no state local.

    const neighborhood = Array.from(neighborhoodFunctions.values())
      .filter((entry) => entry.isActive)
      .map((entry) => entry.instance);

    const stop = Array.from(stopFunctions.values())
      .filter((entry) => entry.isActive)
      .map((entry) => entry.instance);

    const aspiration = Array.from(aspirationFunctions.values())
      .filter((entry) => entry.isActive)
      .map((entry) => entry.instance);

    const buscaTabu = new TabuSearch(
      atribuicoes,
      docentes,
      disciplinas,
      travas,
      formularios,
      parametros,
      [...hardConstraints.values(), ...softConstraints.values()],
      { atribuicoes: atribuicoes },
      neighborhood,
      "Solução",
      100,
      stop,
      aspiration,
      maxPriority + 1
    );

    await new Promise((resolve) => setTimeout(resolve, 0)); // Garante que a UI atualize antes de bloquear

    await buscaTabu.run(() => interrompeRef.current, setDisciplinasAlocadas);

    const solucao: Solucao = {
      atribuicoes: buscaTabu.bestSolution.atribuicoes,
      avaliacao: buscaTabu.bestSolution.avaliacao,
      estatisticas: buscaTabu.statistics,
    };
    setSolucaoAtual(solucao);

    setProcessing(false); // Encerra o processamento
    setInterrompe(false); // Altera o state da flag de interupção para falso
    setDisciplinasAlocadas(0);
  };

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
    const contextoExecucao: ContextoExecucao = {
      disciplinas: [...disciplinas],
      docentes: [...docentes],
      travas: [...travas],
      maxPriority: maxPriority,
      formularios: formularios,
    };
    const idSolucao: string = addNewSolutionToHistory(
      solucaoAtual,
      setHistoricoSolucoes,
      historicoSolucoes,
      TipoInsercao.Algoritmo,
      contextoExecucao
    );
    updateSolutionId(setSolucaoAtual, idSolucao);
    /**
     * Atualiza as atribuições
     */
    updateAtribuicoes(solucaoAtual.atribuicoes);
  };

  /**
   * Processos referentes a aplicação da solução obtida pelo algoritmo ao state global.
   */
  const applySolution = () => {
    ApplySolutionToState();
    addAlerta("A solução foi aplicada com sucesso!", "success");
    handleCloseDialog();
  };

  const saveAlterations = async () => {
    // const { pDisciplinas, pDocentes, pAtribuicoes } = processData(
    //   disciplinas,
    //   docentes,
    //   formularios,
    //   travas,
    //   atribuicoes
    // );

    // const avaliacao = avaliarSolucao(
    //   pAtribuicoes,
    //   pDocentes,
    //   pDisciplinas,
    //   maxPriority + 1, // talvez não seja necessário esse +1 (? 14/02/2025)
    //   parametros,
    //   softConstraints
    // );
    const neighborhood = Array.from(neighborhoodFunctions.values())
      .filter((entry) => entry.isActive)
      .map((entry) => entry.instance);

    const stop = Array.from(stopFunctions.values())
      .filter((entry) => entry.isActive)
      .map((entry) => entry.instance);

    const aspiration = Array.from(aspirationFunctions.values())
      .filter((entry) => entry.isActive)
      .map((entry) => entry.instance);

    const buscaTabu = new TabuSearch(
      atribuicoes,
      docentes,
      disciplinas,
      travas,
      formularios,
      parametros,
      [...hardConstraints.values(), ...softConstraints.values()],
      { atribuicoes: atribuicoes },
      // [
      //   new Add("Adiciona", "Adição"),
      //   new Remove("Remove", "Remover"),
      //   new Swap("Troca", "Trocar"),
      // ],
      neighborhood,
      "Solução",
      100,
      stop,
      aspiration,
      maxPriority + 1
    );

    const avaliacao = (
      await buscaTabu.evaluateNeighbors([
        {
          atribuicoes: atribuicoes,
          isTabu: false,
          movimentos: { add: [], drop: [] },
        },
      ])
    )[0].avaliacao;
    const contextoExecucao: ContextoExecucao = {
      disciplinas: [...disciplinas],
      docentes: [...docentes],
      travas: [...travas],
      maxPriority: maxPriority,
      formularios: formularios,
    };
    saveAtribuicoesInHistoryState(
      atribuicoes,
      avaliacao,
      historicoSolucoes,
      setHistoricoSolucoes,
      setSolucaoAtual,
      contextoExecucao
    );

    addAlerta("As atribuições foram adicionadas ao histórico!", "success");
  };

  /**
   * Remover depois que for feita a tela de Histórico de execuções
   */
  const downalodJson = () => {
    if (!atribuicoes.some((atribuicao) => atribuicao.docentes.length > 0)) {
      addAlerta("Nenhuma atribuição foi realizada!", "warning");
    }

    let filename: string;

    if (solucaoAtual.idHistorico) {
      filename = solucaoAtual.idHistorico + ".json";
      exportJson(
        filename,
        docentes,
        disciplinas,
        atribuicoes,
        travas,
        historicoSolucoes.get(solucaoAtual.idHistorico)
      );
    } else {
      filename = getFormattedDate() + ".json";
      exportJson(filename, docentes, disciplinas, atribuicoes, travas);
    }
  };

  const handleOnMouseEnter = (nome: string, id_disciplina: string) => {
    setHover({
      docente: nome,
      id_disciplina: id_disciplina,
    });

    setHoveredCourese(null);
  };

  /**
   * Caso o docente apresente conflito de horários, a borda de sua célula deve ser vermelha
   */
  const verificaConflitosDocente = (nome_docente: string): boolean => {
    const docenteAtribuicoes = atribuicoes.filter((atribuicao) =>
      atribuicao.docentes.includes(nome_docente)
    );

    if (docenteAtribuicoes.length > 0) {
      const atribuicoesDocente: string[] = atribuicoes
        .filter((atribuicao) => atribuicao.docentes.includes(nome_docente))
        .map((atribuicao) => atribuicao.id_disciplina);

      // Comparar as atribuições para ver se a `Disciplia.conflitos` não incluem umas as outras
      for (let i = 0; i < atribuicoesDocente.length; i++) {
        const disciplinaPivo: Disciplina = disciplinas.find(
          (disciplina) => disciplina.id === atribuicoesDocente[i]
        );

        for (let j = i + 1; j < atribuicoesDocente.length; j++) {
          const disciplinaAtual: Disciplina = disciplinas.find(
            (disciplina) => disciplina.id === atribuicoesDocente[j]
          );
          if (disciplinaAtual === undefined) continue;

          if (disciplinaPivo.conflitos.has(disciplinaAtual.id)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  /**
   * Altera borda dos elementos no hover
   */
  const setBorder = (
    hover: { docente: string; id_disciplina: string },
    atribuicao: {
      docente: string;
      id_disciplina: string;
    },
    tipo: "celula" | "coluna" | "linha"
  ) => {
    const style = {
      borderTop: "1px solid rgba(224, 224, 224, 1)",
      borderRight: "1px solid rgba(224, 224, 224, 1)",
      borderBottom: "1px solid rgba(224, 224, 224, 1)",
      borderLeft: "1px solid rgba(224, 224, 224, 1)",
    };

    if (tipo === "celula") {
      if (hover.docente === atribuicao.docente) {
        style.borderTop = "3px solid rgba(25, 118, 210, 1)";
        style.borderBottom = "3px solid rgba(25, 118, 210, 1)";
      }

      if (hover.id_disciplina === atribuicao.id_disciplina) {
        style.borderLeft = "3px solid rgba(25, 118, 210, 1)";
        style.borderRight = "3px solid rgba(25, 118, 210, 1)";
      }
    }

    if (tipo === "coluna") {
      if (hover.id_disciplina === atribuicao.id_disciplina) {
        style.borderLeft = "3px solid rgba(25, 118, 210, 1)";
        style.borderRight = "3px solid rgba(25, 118, 210, 1)";
      }
    }

    if (tipo === "linha") {
      if (hover.docente === atribuicao.docente) {
        style.borderTop = "3px solid rgba(25, 118, 210, 1)";
        style.borderBottom = "3px solid rgba(25, 118, 210, 1)";
      } else {
        return { border: "initial" };
      }
    }

    return style;
  };

  return (
    <ThemeProvider theme={customTheme}>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        {docentes.length > 0 && disciplinas.length > 0 && (
          <TableContainer sx={{ maxHeight: "88vh", overflow: "scroll" }}>
            <Table
              sx={{ width: "fit-content", height: "fit-content" }}
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
                    <ButtonGroupHeader
                      key="button_group_timetabling"
                      onExecute={executeProcess}
                      onClean={() => setOpenCleanDialog(true)}
                      download={downalodJson}
                      saveAlterations={saveAlterations}
                    />
                  </TableCell>
                  {disciplinas.map(
                    (disciplina) =>
                      disciplina.ativo && (
                        <TableCell
                          key={disciplina.id}
                          onClick={(e) =>
                            handleColumnClick(e, {
                              id_disciplina: disciplina.id,
                              tipo_trava: TipoTrava.Column,
                            })
                          }
                          style={{
                            backgroundColor: "white",
                            margin: 0,
                            padding: 1,
                            ...setBorder(
                              hover,
                              { docente: null, id_disciplina: disciplina.id },
                              "coluna"
                            ),
                          }}
                        >
                          <HeaderCell
                            key={disciplina.id}
                            disciplina={disciplina}
                            //onHeaderClick={(e) => handleColumnClick(e, {id_disciplina: disciplina.id, tipo_trava: TipoTrava.Column})}
                            setHeaderCollor={setHeaderCollor}
                            setParentHoveredCourse={setHoveredCourese}
                          />
                        </TableCell>
                      )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows().map((atribuicao) => (
                  <TableRow key={atribuicao.nome} sx={{ maxHeight: "2rem" }}>
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
                        padding: 0,
                      }}
                      onClick={(e) =>
                        handleRowClick(e, {
                          nome_docente: atribuicao.nome,
                          tipo_trava: TipoTrava.Row,
                        })
                      }
                    >
                      <Typography
                        align="left"
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: setColumnCollor(atribuicao.nome),
                          padding: "3px",
                          width: "100%",
                          ...setBorder(
                            hover,
                            { docente: atribuicao.nome, id_disciplina: null },
                            "linha"
                          ),
                        }}
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
                              ...setBorder(
                                hover,
                                {
                                  docente: atribuicao.nome,
                                  id_disciplina: prioridade.id_disciplina,
                                },
                                "celula"
                              ),
                            }}
                            onClick={(event) =>
                              handleCellClick(event, {
                                nome_docente: atribuicao.nome,
                                id_disciplina: prioridade.id_disciplina,
                                tipo_trava: TipoTrava.Cell,
                              })
                            }
                            onMouseEnter={() =>
                              handleOnMouseEnter(
                                atribuicao.nome,
                                prioridade.id_disciplina
                              )
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
        progress={{
          current: disciplinasAlocadasRef.current,
          total: disciplinas.filter((disciplina) => disciplina.ativo).length,
        }}
      />

      {hoveredCourese && (
        <HoveredCourse
          disciplina={hoveredCourese}
          setHoveredCourese={setHoveredCourese}
        />
      )}

      <CleanAlertDialog
        openDialog={openCleanDialog}
        cleanState={cleanStateAtribuicoes}
        onCloseDialog={() => setOpenCleanDialog(false)}
      />
    </ThemeProvider>
  );
}
