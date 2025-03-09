"use client";
import { useAlgorithmContext } from "@/context/Algorithm";
import {
  Box,
  Collapse,
  Container,
  Divider,
  Grid2,
  IconButton,
  Typography,
} from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import React, { useState } from "react";
import ParameterComponent from "./_components/ParameterComponent";
import { useAlertsContext } from "@/context/Alerts";
import Restricoes from "../restricoes/page";

export default function Configuracoes() {
  const { parametros, setParametros } = useAlgorithmContext();

  const { addAlerta } = useAlertsContext();

  const [openGlobais, setOpenGlobais] = useState(false);
  const [openRestricoes, setOpenRestricoes] = useState(false);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ padding: 2, maxHeight: "80vh", overflowY: "auto" }}>
        {/* Parâmetros Globais */}
        <Box
          display="flex"
          alignItems="center"
          onClick={() => setOpenGlobais(!openGlobais)}
          sx={{ cursor: "pointer" }}
        >
          <IconButton>
            {openGlobais ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
          <Typography variant="h5" gutterBottom>
            Parâmetros Globais
          </Typography>
        </Box>
        <Divider sx={{ marginBottom: "1em" }} />
        <Collapse in={openGlobais}>
          <Grid2
            container
            spacing={2}
            alignItems="center"
            justifyContent="center"
          >
            <ParameterComponent
              name={"Tabu Size"}
              isActive={parametros.tabuSize.isActive}
              description="Representa o tamanho da lista tabu."
              key={"tabuSize"}
              value={parametros.tabuSize.value}
              setValue={(newValue: number) => {
                setParametros((prev) => ({
                  ...prev,
                  tabuSize: {
                    value: newValue,
                    isActive: prev.tabuSize.isActive,
                  },
                }));
              }}
              setIsActive={(newState: boolean) =>
                setParametros((prev) => ({
                  ...prev,
                  tabuSize: { value: prev.tabuSize.value, isActive: newState },
                }))
              }
              showInformations={addAlerta}
            />

            <ParameterComponent
              name={"Iterações Máximas"}
              isActive={parametros.maxIterations.isActive}
              description="Quantidade máxima de iterações que o algoritmo pode atingir."
              key={"maxIterations"}
              value={parametros.maxIterations.value}
              setValue={(newValue: number) => {
                setParametros((prev) => ({
                  ...prev,
                  maxIterations: {
                    value: newValue,
                    isActive: prev.maxIterations.isActive,
                  },
                }));
              }}
              setIsActive={(newState: boolean) =>
                setParametros((prev) => ({
                  ...prev,
                  maxIterations: {
                    value: prev.maxIterations.value,
                    isActive: newState,
                  },
                }))
              }
              showInformations={addAlerta}
            />
          </Grid2>
        </Collapse>

        {/* Restrições */}
        <Box
          display="flex"
          alignItems="center"
          onClick={() => setOpenRestricoes(!openRestricoes)}
          sx={{ cursor: "pointer", marginTop: "2em" }}
        >
          <IconButton>
            {openRestricoes ? (
              <KeyboardArrowUpIcon />
            ) : (
              <KeyboardArrowDownIcon />
            )}
          </IconButton>
          <Typography variant="h5" gutterBottom>
            Restrições
          </Typography>
        </Box>
        <Divider sx={{ marginBottom: "1em" }} />
        <Collapse in={openRestricoes}>
          <Restricoes />
        </Collapse>
      </Box>
    </Container>
  );
}
