import React from 'react';
import { Button, ButtonGroup } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import DownloadIcon from '@mui/icons-material/Download';

interface ButtonGroupHeaderProps {
  onExecute: () => void;
  onClean: () => void;
  download: () => void
}

/**
 * Componente responsável por gerar os botões referentes aos processos existentes no componente pai.
 */
const ButtonGroupHeader: React.FC<ButtonGroupHeaderProps> = ({ onExecute, onClean, download }) => {

  return (
  <ButtonGroup variant="outlined" aria-label="Button group">
    <Button onClick={onExecute}>
      <PlayArrowIcon />
    </Button>
    <Button onClick={onClean}>
      <CleaningServicesIcon />
    </Button>
    <Button onClick={download}>
      <DownloadIcon />
    </Button>
  </ButtonGroup>
);}

export default ButtonGroupHeader;
