import React from "react";
import { Button, Grid2, Tooltip } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import DownloadIcon from "@mui/icons-material/Download";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import { useSolutionHistory } from "@/context/SolutionHistory/hooks";

interface ButtonGroupHeaderProps {
  onExecute: () => void;
  onClean: () => void;
  download: () => void;
  saveAlterations: () => void;
}

/**
 * Componente responsável por gerar os botões referentes aos processos existentes no componente pai.
 */
const ButtonGroupHeader: React.FC<ButtonGroupHeaderProps> = ({
  onExecute,
  onClean,
  download,
  saveAlterations,
}) => {
  const {solucaoAtual} = useSolutionHistory();

  return (
    <Grid2
      container
      spacing={1}
      justifyItems="center"
      alignItems="center"
      justifyContent="center"
    >
      <Grid2 key="Play">
        <Tooltip
          title="Executar"
          slotProps={{
            popper: {
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: [0, -5],
                  },
                },
              ],
            },
          }}
          arrow
        >
          <Button variant="outlined" onClick={onExecute}>
            <PlayArrowIcon />
          </Button>
        </Tooltip>
      </Grid2>

      <Grid2 key="Clean">
        <Tooltip
          title="Limpar"
          slotProps={{
            popper: {
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: [0, -5],
                  },
                },
              ],
            },
          }}
          arrow
        >
          <Button variant="outlined" onClick={onClean}>
            <CleaningServicesIcon />
          </Button>
        </Tooltip>
      </Grid2>

      <Grid2 key="Download">
        <Tooltip
          title="Download"
          slotProps={{
            popper: {
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: [0, -5],
                  },
                },
              ],
            },
          }}
          arrow
        >
          <Button variant="outlined" onClick={download}>
            <DownloadIcon />
          </Button>
        </Tooltip>
      </Grid2>

      <Grid2 key="Save">
        <Tooltip
          title="Salvar"
          slotProps={{
            popper: {
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: [0, 5],
                  },
                },
              ],
            },
          }}
          arrow
        >
          <span>
            <Button variant="outlined" onClick={saveAlterations} disabled={solucaoAtual.idHistorico !== undefined}>
              <SaveAltIcon />
            </Button>
          </span>
        </Tooltip>
      </Grid2>
    </Grid2>
  );
};

export default ButtonGroupHeader;
