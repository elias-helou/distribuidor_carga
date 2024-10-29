"use client";

import { useGlobalContext } from "@/context/Global";
import { Parametros } from "@/context/Global/utils";
import { Grid2, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";

export default function Parameters() {

  const parNames = {
    'k1': 'Prioridades',
    'k2': 'Conflitos',
    'k3': 'Tamanho tabu',
    'k4': 'Não atribuída',
    'k5': 'Número de disciplinas',
    'k6': 'K6'
  };

  const { parametros, setParametros } = useGlobalContext();

  const [erros, setErros] = useState<{ [key in keyof Parametros]?: boolean }>(
    {}
  );
  const [campoFocado, setCampoFocado] = useState<keyof Parametros | null>(null);

  const atualizarParametro = (chave: keyof Parametros, valor: number) => {
    setParametros((prev) => ({
      ...prev,
      [chave]: valor,
    }));
  };

  const handleFocus = (chave: keyof Parametros) => {
    setCampoFocado(chave);
  };

  const handleChange =
    (chave: keyof Parametros) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const valor = e.target.value;
      if (!isNaN(Number(valor))) {
        setErros((prev) => ({ ...prev, [chave]: false }));
        atualizarParametro(chave, Number(valor));
      } else {
        setErros((prev) => ({ ...prev, [chave]: true }));
      }
    };

  return (
    <Grid2
      container
      spacing={2}
      columnSpacing={4}
      rowSpacing={4}
      alignItems="center"
      justifyContent="center"
      columns={4} // Configura o grid para 2 itens por linha
      sx={{ maxWidth: "40em", margin: "0 auto" }}
    >
      {Object.keys(parametros).map((chave) => (
        <Grid2 key={chave} size={{ xs: 2, sm: 2 }}>
          <Paper
            elevation={2}
            sx={{
              textAlign: "center",
              padding: 2,
              backgroundColor: "background.paper",
              width: "100%",
            }}
          >
            <Typography variant="h6" gutterBottom>
              {parNames[ chave ]}
            </Typography>
            {/* <ParametroField chave={chave as keyof Parametros} /> */}
            <TextField
              id={`outlined-${chave}`}
              label={chave.toUpperCase()}
              value={parametros[chave]}
              onChange={handleChange(chave as keyof Parametros)}
              onFocus={() => handleFocus(chave as keyof Parametros)}
              focused={campoFocado === chave}
              error={!!erros[chave]}
              helperText={erros[chave] ? "O valor deve ser numérico" : ""}
              variant="outlined"
              margin="normal"
              fullWidth
              aria-describedby={`${chave}-helper-text`}
            />
          </Paper>
        </Grid2>
      ))}
    </Grid2>
  );
}
