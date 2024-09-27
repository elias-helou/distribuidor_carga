"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import CloseIcon from "@mui/icons-material/Close";

export interface IAlertProps {
  id: number;
  type: "success" | "info" | "warning" | "error";
  message: string;
  handleClose?: () => void;
  closeTime: number;
}

export default function CustomAlert(props: IAlertProps) {
  const [open, setOpen] = React.useState(true);

  /**
   * Função que executa a função passada pelo componente 'pai' com o principal intúito de fechar o alerta.
   */
  const handleExited = () => {
    // Executa quando a animação de colapso termina
    if (props.handleClose) {
      setOpen(false) // Fecha alerta
      setTimeout(() => {
        props.handleClose(); // Chama a função no elemento pai que remove o alerta da fila
      }, 1000) // Adiciona um delay para remover o arleta da fila do estado visando deixa-lo executar a animação de "fechar"
    }
  };

  /**
   * ``useEffect`` utilizado para adicionar o comportamento de fechar o alerta em X segundos.
   */
  React.useEffect(() => {
    setTimeout(() => {
      handleExited();
    }, props.closeTime * 1000);
  });

  return (
    <Box sx={{ width: "100%" }}>
      <Collapse in={open} onExited={handleExited}>
        <Alert
          key={props.id}
          severity={props.type}
          variant="filled"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setOpen(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {props.message}
        </Alert>
      </Collapse>
    </Box>
  );
}
