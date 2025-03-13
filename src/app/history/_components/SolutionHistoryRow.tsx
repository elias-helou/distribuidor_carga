import { HistoricoSolucao } from "@/context/Global/utils";
import {
  Box,
  Collapse,
  IconButton,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { Fragment, useCallback, useState } from "react";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SolutionHistoryButtonGroup from "./SolutionHistoryButtonGroup";
import { useSolutionHistory } from "@/context/SolutionHistory/hooks";
import { useAlertsContext } from "@/context/Alerts";
import SolutionHistoryStatistics, {
  TreeDisciplina,
} from "./SolutionHistoryStatistics";
import { exportJson, getFormattedDate } from "@/app/atribuicoes";
import Link from "next/link";

interface SolutionHistoryRowProps {
  id: string;
  solucao: HistoricoSolucao;
  setHoveredCourese: React.Dispatch<
    React.SetStateAction<TreeDisciplina | null>
  >;
}

const SolutionHistoryRow: React.FC<SolutionHistoryRowProps> = ({
  id,
  solucao,
  setHoveredCourese,
}) => {
  const [open, setOpen] = useState(false);
  const {
    removeSolutionFromHistory,
    restoreHistoryToSolution,
    solucaoAtual,
    historicoSolucoes,
  } = useSolutionHistory();
  const { addAlerta } = useAlertsContext();

  /**
   * Função a ser passada para o componente filho a fim de remover uma solução do histórico e apresentar
   * um feedback na tela.
   */
  const handleRemoveSolutionFromHistory = (id: string) => {
    removeSolutionFromHistory(id);
    addAlerta("A solução foi removida do histórico!", "warning");
  };

  /**
   * Função a ser passada para o componente filho a fim de atualizar a solução atual e apresentar
   * um feedback na tela.
   */
  const handleRestoreHistoryToSolution = (id: string) => {
    restoreHistoryToSolution(id);
    addAlerta(`A solução ${solucao.datetime} foi aplicada!`, "success");
  };

  const handleDownloadSolutionFromHistory = useCallback(
    (id: string) => {
      const filename = getFormattedDate() + ".json";
      exportJson(
        filename,
        solucao.contexto.docentes,
        solucao.contexto.disciplinas,
        solucao.solucao.atribuicoes,
        solucao.contexto.travas,
        historicoSolucoes.get(id)
      );

      addAlerta(`A solução ${solucao.datetime} foi baixada!`, "success");
    },
    [
      addAlerta,
      historicoSolucoes,
      solucao.contexto.disciplinas,
      solucao.contexto.docentes,
      solucao.contexto.travas,
      solucao.datetime,
      solucao.solucao.atribuicoes,
    ]
  );

  return (
    <Fragment key={`fragment_${id}`}>
      <TableRow
        key={`row_principal_${id}`}
        sx={{
          backgroundColor:
            solucaoAtual.idHistorico === id
              ? "rgba(25, 118, 210, 0.12)"
              : "white",
        }}
      >
        <TableCell key={`icon_${id}`}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <KeyboardArrowUpIcon key={`arrowUp_${id}`} />
            ) : (
              <KeyboardArrowDownIcon key={`arrowDown_${id}`} />
            )}
          </IconButton>
        </TableCell>
        <TableCell
          component="th"
          scope="row"
          align="center"
          key={`identificador_${id}`}
          // sx={{fontWeight: solucaoAtual.idHistorico === id ? 'bold' : 'normal'}}
        >
          <Link href={`/history/${id}`}>{solucao.datetime}</Link>
        </TableCell>
        <TableCell align="center" key={`avaliacao_${id}`}>
          {solucao.solucao.avaliacao}
        </TableCell>
        <TableCell align="center" key={`insercao_${id}`}>
          {solucao.tipoInsercao}
        </TableCell>
        <TableCell align="center" key={`botoes_${id}`}>
          <SolutionHistoryButtonGroup
            key={`SolutionHistoryButtonGroup_${id}`}
            id={id}
            remove={handleRemoveSolutionFromHistory}
            restore={handleRestoreHistoryToSolution}
            download={handleDownloadSolutionFromHistory}
          />
        </TableCell>
      </TableRow>
      <TableRow key={`row_collapse_${id}`}>
        <TableCell
          style={{ paddingBottom: 0, paddingTop: 0 }}
          colSpan={6}
          key={`cell_collapse_${id}`}
        >
          <Collapse
            in={open}
            timeout="auto"
            unmountOnExit
            key={`collapse_${id}`}
          >
            <Box sx={{ margin: 1 }} key={`box_collapse_${id}`}>
              <Typography
                variant="h6"
                gutterBottom
                component="div"
                key={`collapse_details_${id}`}
              >
                Detalhes
              </Typography>
              <SolutionHistoryStatistics
                key={`componente_estatisticas_${id}`}
                id={id}
                solucao={solucao}
                setHoveredCourese={setHoveredCourese}
              />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
};

export default SolutionHistoryRow;
