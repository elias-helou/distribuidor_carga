import React, { useState } from "react";
import {
  Grid2,
  Paper,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Divider,
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DeleteIcon from "@mui/icons-material/Delete";

interface ConstraintCardProps {
  name: string;
  tipoInicial: string;
  penalidadeInicial: string;
  onChange: (name: string, tipo: string, penalidade: string) => void;
  onDelete: (name: string, tipo: string, penalidade: string) => void;
}

export default function ConstraintCard({
  name,
  penalidadeInicial,
  tipoInicial,
  onChange,
  onDelete,
}: ConstraintCardProps) {
  const [tipo, setTipo] = useState(tipoInicial);
  const [penalidade, setPenalidade] = useState(penalidadeInicial);
  const [erro, setErro] = useState(false);

  const handleTipoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTipo(event.target.value);
    onChange(name, event.target.value, penalidade); // Atualiza o valor no componente pai
  };

  const handlePenalidadeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const valor = event.target.value;
    if (/^\d*$/.test(valor)) {
      setPenalidade(valor);
      setErro(false);
      onChange(name, tipo, valor); // Atualiza o valor no componente pai
    } else {
      setErro(true);
    }
  };

  return (
    <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 2,
          minHeight: "22em", // Altura mínima uniforme
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "transform 0.3s",
          "&:hover": { transform: "scale(1.02)" },
        }}
      >
        <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
          {name}
        </Typography>

        <FormControl component="fieldset" sx={{ mt: 2, width: "100%" }}>
          <FormLabel component="legend" sx={{ mb: 1, color: "text.secondary" }}>
            Tipo de Restrição
          </FormLabel>
          <RadioGroup
            name={`${name}-constraint-type`}
            value={tipo}
            onChange={handleTipoChange}
            row
            //sx={{ justifyContent: "center" }} // Alinha os radios ao centro
          >
            <FormControlLabel value="Hard" control={<Radio />} label="Hard" />
            <FormControlLabel value="Soft" control={<Radio />} label="Soft" />
          </RadioGroup>
        </FormControl>

        <TextField
          label="Penalidade"
          variant="outlined"
          value={penalidade}
          onChange={handlePenalidadeChange}
          fullWidth
          size="small"
          placeholder="Digite a penalidade"
          error={erro}
          helperText={erro ? "Digite apenas números." : ""}
          sx={{ mt: 2 }}
        />

        <Divider sx={{ my: 2 }} />

        <Stack
          direction="row"
          spacing={2}
          justifyContent="center" // Centraliza os botões horizontalmente
          alignItems="center"
          sx={{ mt: 2, margin: 0 }}
        >
          <Tooltip
            title="Informações"
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
            <IconButton
              color="info"
              onClick={() => console.log("Informações")}
              size="large"
            >
              <InfoOutlinedIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          <Tooltip
            title="Excluir"
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
            <IconButton
              color="error"
              onClick={() => onDelete(name, tipo, penalidade)}
              size="large"
            >
              <DeleteIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>
    </Grid2>
  );
}
