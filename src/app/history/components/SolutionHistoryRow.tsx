import { HistoricoSolucao } from "@/context/Global/utils";
import {
  Box,
  Collapse,
  IconButton,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { Fragment, useState } from "react";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

interface SolutionHistoryRowProps {
  id: string;
  solucao: HistoricoSolucao;
}

const SolutionHistoryRow: React.FC<SolutionHistoryRowProps> = ({
  id,
  solucao,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Fragment key={`fragment_${id}`}>
      <TableRow key={`row_principal_${id}`}>
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
        >
          {solucao.id}
        </TableCell>
        <TableCell align="center" key={`avaliacao_${id}`}>
          {solucao.solucao.avaliacao}
        </TableCell>
        <TableCell align="center" key={`insercao_${id}`}>
          Processo
        </TableCell>
        <TableCell align="center" key={`botoes_${id}`}>
          Botões
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
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
};

export default SolutionHistoryRow;
