"use client";
import { useAlgorithmContext } from "@/context/Algorithm";
import { useAlertsContext } from "@/context/Alerts";
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
import Restricoes from "../restricoes/page";
import NeighborhoodComponent from "./_components/NeighborhoodComponent";
import { IteracoesMaximas } from "@/TabuSearch/StopCriteria/IteracoesMaximas";
import { IteracoesSemModificacao } from "@/TabuSearch/StopCriteria/IteracoesSemModificacao";

export default function Configuracoes() {
  const {
    parametros,
    setParametros,
    neighborhoodFunctions,
    setNeighborhoodFunctions,
    stopFunctions,
    setStopFunctions,
    aspirationFunctions,
    setAspirationFunctions,
  } = useAlgorithmContext();

  const { addAlerta } = useAlertsContext();

  const [openSections, setOpenSections] = useState({
    globais: false,
    restricoes: false,
    neighborhood: false,
    stop: false,
    aspiration: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const renderSection = (
    title: string,
    sectionKey: keyof typeof openSections,
    content: JSX.Element
  ) => (
    <>
      <Box
        display="flex"
        alignItems="center"
        onClick={() => toggleSection(sectionKey)}
        sx={{ cursor: "pointer", marginTop: "2em" }}
      >
        <IconButton>
          {openSections[sectionKey] ? (
            <KeyboardArrowUpIcon />
          ) : (
            <KeyboardArrowDownIcon />
          )}
        </IconButton>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
      </Box>
      <Divider sx={{ marginBottom: "1em" }} />
      <Collapse in={openSections[sectionKey]}>{content}</Collapse>
    </>
  );

  const renderNeighborhoodFunctions = () =>
    Array.from(neighborhoodFunctions.entries()).map(([key, func]) => (
      <NeighborhoodComponent
        key={key}
        name={func.instance.name}
        isActive={func.isActive}
        description={func.instance.description}
        showInformations={addAlerta}
        setIsActive={(newState) => {
          setNeighborhoodFunctions((prev) => {
            const newMap = new Map(prev);
            newMap.set(key, { ...func, isActive: newState });
            return newMap;
          });
        }}
      />
    ));

  const renderStopFunctions = () =>
    Array.from(stopFunctions.entries()).map(([key, func]) => {
      const value =
        func.instance instanceof IteracoesMaximas
          ? func.instance.maxIteracoes
          : func.instance instanceof IteracoesSemModificacao
          ? func.instance.limiteIteracoesSemModificacao
          : 0;

      return (
        <ParameterComponent
          key={key}
          name={func.instance.name}
          isActive={func.isActive}
          description={func.instance.description}
          value={value}
          setValue={(newValue) => {
            if (func.instance instanceof IteracoesMaximas) {
              func.instance.maxIteracoes = newValue;
            } else if (func.instance instanceof IteracoesSemModificacao) {
              func.instance.limiteIteracoesSemModificacao = newValue;
            }

            setStopFunctions((prev) => {
              const updated = new Map(prev);
              updated.set(key, func);
              return updated;
            });
          }}
          setIsActive={(newState) => {
            setStopFunctions((prev) => {
              const updated = new Map(prev);
              updated.set(key, { ...func, isActive: newState });
              return updated;
            });
          }}
          showInformations={addAlerta}
        />
      );
    });

  const renderAspirationFunctions = () =>
    Array.from(aspirationFunctions.entries()).map(([key, func]) => (
      <NeighborhoodComponent
        key={key}
        name={func.instance.name}
        isActive={func.isActive}
        description={func.instance.description}
        showInformations={addAlerta}
        setIsActive={(newState) => {
          setAspirationFunctions((prev) => {
            const newMap = new Map(prev);
            newMap.set(key, { ...func, isActive: newState });
            return newMap;
          });
        }}
      />
    ));

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ padding: 2, maxHeight: "80vh", overflowY: "auto" }}>
        {renderSection(
          "Parâmetros Globais",
          "globais",
          <Grid2
            container
            spacing={2}
            alignItems="center"
            justifyContent="center"
          >
            <ParameterComponent
              name="Tabu Size"
              isActive={parametros.tabuSize.isActive}
              description="Representa o tamanho da lista tabu."
              value={parametros.tabuSize.value}
              setValue={(newValue) => {
                setParametros((prev) => ({
                  ...prev,
                  tabuSize: {
                    value: newValue,
                    isActive: prev.tabuSize.isActive,
                  },
                }));
              }}
              setIsActive={(newState) =>
                setParametros((prev) => ({
                  ...prev,
                  tabuSize: { value: prev.tabuSize.value, isActive: newState },
                }))
              }
              showInformations={addAlerta}
            />
          </Grid2>
        )}

        {renderSection("Restrições", "restricoes", <Restricoes />)}

        {renderSection(
          "Geração da Vizinhança",
          "neighborhood",
          <Grid2
            container
            spacing={2}
            alignItems="center"
            justifyContent="center"
          >
            {renderNeighborhoodFunctions()}
          </Grid2>
        )}

        {renderSection(
          "Interrupção do Algoritmo",
          "stop",
          <Grid2
            container
            spacing={2}
            alignItems="center"
            justifyContent="center"
          >
            {renderStopFunctions()}
          </Grid2>
        )}

        {renderSection(
          "Critérios de Aspiração",
          "aspiration",
          <Grid2
            container
            spacing={2}
            alignItems="center"
            justifyContent="center"
          >
            {renderAspirationFunctions()}
          </Grid2>
        )}
      </Box>
    </Container>
  );
}
