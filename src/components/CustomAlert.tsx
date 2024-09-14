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
  setFatherState?: () => void;
}

export default function CustomAlert(props: IAlertProps) {
  const [open, setOpen] = React.useState(true);

  const handleExited = () => {
    // Executa quando a animação de colapso termina
    if (props.setFatherState) {
      props.setFatherState(); // Executa a função passada após o fechamento
    }
  };

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
