"use client";
import React from "react";
import { Grid2, Typography, Paper, Box } from "@mui/material";
import { useGlobalContext } from "@/context/Global";
import { Disciplina } from "@/context/Global/utils";

const diasDaSemana = ["Seg.", "Ter.", "Qua.", "Qui.", "Sex."];
const horarios = Array.from(
  { length: 17 },
  (_, i) => `${String(7 + i).padStart(2, "0")}:00`
); // 07:00 a 23:00

export default function ComponenteCalendario() {
  const { disciplinas } = useGlobalContext();
  const mapDisciplinas = new Map<string, Disciplina>();

  disciplinas.forEach((disciplina) =>
    mapDisciplinas.set(disciplina.id, disciplina)
  );

  const disciplinasPorBloco = (dia: string, horario: string) => {
    return Array.from(mapDisciplinas.values()).filter((disciplina) =>
      disciplina.horarios.some((h) => h.dia === dia && h.inicio === horario)
    );
  };

  return (
    <Box sx={{ padding: 2, maxHeight: "80vh", overflowY: "auto" }}>
      <Typography variant="h4" gutterBottom align="center">
        Calendário Semanal
      </Typography>
      <Grid2 container spacing={1} sx={{ border: "1px solid #ccc" }}>
        {/* Cabeçalho: Dias da Semana */}
        <Grid2
          container
          size={{ xs: 12 }}
          spacing={0}
          sx={{
            position: "sticky",
            top: 0,
            backgroundColor: "#fff",
            zIndex: 10,
            borderBottom: "1px solid #ccc",
          }}
        >
          <Grid2 size={{ xs: 1 }}>
            <Typography
              variant="body1"
              align="center"
              sx={{ fontWeight: "bold" }}
            >
              Horários
            </Typography>
          </Grid2>
          {diasDaSemana.map((dia) => (
            <Grid2 size={{ xs: 2 }} key={dia}>
              <Typography
                variant="body1"
                align="center"
                sx={{ fontWeight: "bold" }}
              >
                {dia}
              </Typography>
            </Grid2>
          ))}
        </Grid2>

        {/* Linhas de horários */}
        {horarios.map((horario) => (
          <Grid2
            container
            size={{ xs: 12 }}
            spacing={0}
            key={horario}
            alignContent="center"
            textAlign="center"
          >
            {/* Coluna de horário */}
            <Grid2 size={{ xs: 1 }} alignContent="center" textAlign="center">
              <Typography
                variant="body2"
                align="center"
                sx={{ borderRight: "1px solid #ccc" }}
              >
                {horario}
              </Typography>
            </Grid2>

            {/* Colunas dos dias */}
            {diasDaSemana.map((dia) => (
              <Grid2 size={{ xs: 2 }} key={`${dia}-${horario}`}>
                <Paper
                  sx={{
                    minHeight: 60,
                    padding: 1,
                    backgroundColor: "#f9f9f9",
                    border: "1px solid #e0e0e0",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {disciplinasPorBloco(dia, horario).map((disciplina) => (
                    <Typography
                      variant="body2"
                      key={disciplina.id}
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        width: "100%", // Garante que respeite o espaço do container
                      }}
                    >
                      {disciplina.nome}
                    </Typography>
                  ))}
                </Paper>
              </Grid2>
            ))}
          </Grid2>
        ))}
      </Grid2>
    </Box>
  );
}
