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
import NeighborhoodComponent from "./_components/NeighborhoodComponent";

export default function Configuracoes() {
  const {
    parametros,
    setParametros,
    neighborhoodFunctions,
    setNeighborhoodFunctions,
  } = useAlgorithmContext();

  const { addAlerta } = useAlertsContext();

  const [openGlobais, setOpenGlobais] = useState(false);
  const [openRestricoes, setOpenRestricoes] = useState(false);
  const [openNeighborhoodFunctions, setOpenNeighborhoodFunctions] =
    useState(false);

  /**
   * Função responsável por gerar e retornar os componentes referentes as funções
   * de geração da vizinhança
   */
  const renderNeighborhoodFunctions = () => {
    const toRender = [];
    for (const _func of neighborhoodFunctions.keys()) {
      const func = neighborhoodFunctions.get(_func);
      toRender.push(
        <NeighborhoodComponent
          key={_func}
          name={func.instance.name}
          isActive={func.isActive}
          description={func.instance.description}
          showInformations={addAlerta}
          setIsActive={(newState: boolean) => {
            setNeighborhoodFunctions((prev) => {
              const newMap = new Map(prev); // Criar uma cópia do Map
              const entry = newMap.get(_func); // Pegar o valor atual da função

              if (entry) {
                newMap.set(_func, { ...entry, isActive: newState }); // Atualizar a propriedade isActive
              }

              return newMap; // Retornar o novo Map atualizado
            });
          }}
        />
      );
    }

    return toRender;
  };

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

        {/* Geração de vizinhos */}
        <Box
          display="flex"
          alignItems="center"
          onClick={() =>
            setOpenNeighborhoodFunctions(!openNeighborhoodFunctions)
          }
          sx={{ cursor: "pointer", marginTop: "2em" }}
        >
          <IconButton>
            {openNeighborhoodFunctions ? (
              <KeyboardArrowUpIcon />
            ) : (
              <KeyboardArrowDownIcon />
            )}
          </IconButton>
          <Typography variant="h5" gutterBottom>
            Geração da Vizinhança
          </Typography>
        </Box>
        <Divider sx={{ marginBottom: "1em" }} />
        <Collapse in={openNeighborhoodFunctions}>
          <Grid2
            container
            spacing={2}
            alignItems="center"
            justifyContent="center"
          >
            {renderNeighborhoodFunctions()}
          </Grid2>
        </Collapse>
      </Box>
    </Container>
  );
}
