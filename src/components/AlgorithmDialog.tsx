import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import CloseIcon from '@mui/icons-material/Close';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import { useGlobalContext } from '@/context/Global';

interface AlgoritmoDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: () => void;
  onStop: () => void;
  processing: boolean;
  itearions: number;
}

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary' }}
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

export default function AlgoritmoDialog({
  open,
  onClose,
  onApply,
  onStop,
  processing,
  itearions
}: AlgoritmoDialogProps) {
  const {disciplinas} = useGlobalContext()

  const progress = (): number => {
    if(!processing) {
      return 100
    }
    const value = Math.ceil(100 * itearions / (disciplinas.length + 10)) // 10 representa as não mudanças da melhor solução para a interrupção
    
    return value >= 100 ? 100 : value
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Execução do algoritmo"}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        {processing && <><DialogContentText id="alert-dialog-description">
          O processo está sendo executado e logo será possível aplicar a solução encontrada.
        </DialogContentText>
        <Box sx={{ width: '100%' }}>
      <LinearProgressWithLabel value={progress()} />
    </Box></>
        }
        {!processing && <DialogContentText id="alert-dialog-description">
          O processo foi concluído! Agora você pode aplicar a solução ou fechar esta tela clicando no X localizado acima.
        </DialogContentText>}

      </DialogContent>
      <DialogActions>
        <Button
          onClick={onStop}
          variant="contained"
          disabled={!processing}
          color="error"
        >
          Parar
        </Button>
        <LoadingButton
          variant={processing ? "outlined" : "contained"}
          loading={processing}
          onClick={onApply}
        >
          Aplicar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
