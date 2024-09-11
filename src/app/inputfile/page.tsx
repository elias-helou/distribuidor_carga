"use client";

import * as React from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PublishRoundedIcon from "@mui/icons-material/PublishRounded";
import CloseIcon from "@mui/icons-material/Close";
import { Alert, Box, Collapse, IconButton, Stack } from "@mui/material";
import { useGlobalContext } from "@/context/Global";

import {
  processAndUpdateState,
  processAtribuicoes,
  processDisciplinas,
  processDocentes,
  processFormularios,
} from "./UpdateState";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function InputFileUpload() {
  const [activeLoader, setActiveLoader] = React.useState<boolean>(true); // Controla se o botão de carregar estará habilitado
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null); // Armazena o arquivo selecionado
  const [fileContent, setFileContent] = React.useState(null); // Armazena o conteúdo do arquivo JSON
  const [open, setOpen] = React.useState(false); // Alerta de erro
  const [message, setMessage] = React.useState("");
  const {
    atribuicoes,
    setAtribuicoes,
    disciplinas,
    setDisciplinas,
    docentes,
    setDocentes,
    formularios,
    setFormularios
  } = useGlobalContext();

  // Função para lidar com a seleção de arquivo
  const setFileState = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      // Verifica se o arquivo é do tipo JSON
      if (file.type === "application/json") {
        setSelectedFile(file);
        setActiveLoader(false); // Habilita o botão "Carregar arquivo"
      } else {
        //alert("Por favor, selecione um arquivo JSON.");
        setMessage("Por favor, selecione um arquivo JSON.");
        setOpen(true);
        setActiveLoader(true); // Desabilita o botão caso não seja JSON
      }
    }
  };

  // Função para lidar com o clique no botão de carregar
  const handleFileUpload = () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          setFileContent(json); // Armazena o conteúdo JSON
          console.log("Conteúdo do arquivo JSON:", json);
          loadContext(json);
        } catch (error) {
          setMessage("Erro ao processar o arquivo JSON.");
          setOpen(true);
        }
      };
      reader.readAsText(selectedFile); // Lê o arquivo como texto
    }
  };

  const loadContext = (json: Record<string, any>) => {
    // Processa e atualiza o estado de "docentes"
    processAndUpdateState(
      json,
      ["docentes", "saldos"],
      processDocentes,
      setDocentes
    );

    // Processa e atualiza o estado de "disciplinas"
    processAndUpdateState(
      json,
      "disciplinas",
      processDisciplinas,
      setDisciplinas
    );

    // Processa e atualiza o estado de "atribuicoes"
    processAndUpdateState(
      json,
      "atribuicao",
      processAtribuicoes,
      setAtribuicoes
    );

    // Processa e atualiza o estado de "formulários"
    processAndUpdateState(
      json,
      "formularios",
      processFormularios,
      setFormularios
    );
  };

  return (
    <Box
      sx={{ width: "100%" }}
      display="flex"
      flexDirection="column"
      alignItems="flex-end"
    >
      <Box sx={{ width: "100%" }} display="flex" justifyContent="center">
        <Stack
          sx={{ width: "50%" }}
          display="flex"
          justifyContent="space-between"
          flexDirection="row"
          flexWrap="wrap"
        >
          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
          >
            Escolher arquivo
            <VisuallyHiddenInput
              type="file"
              onChange={(event) => setFileState(event.target.files)}
              multiple={false}
            />
          </Button>
          <Button
            variant="contained"
            tabIndex={0}
            startIcon={<PublishRoundedIcon />}
            disabled={activeLoader} // O botão é habilitado após a escolha do arquivo
            onClick={handleFileUpload} // Chama a função para processar o arquivo
          >
            Carregar arquivo
            <VisuallyHiddenInput type="file" />
          </Button>
        </Stack>
      </Box>
      <Box sx={{ width: "30%", margin: "5px" }}>
        <Collapse in={open}>
          <Alert
            severity="error"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setOpen(false);
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2 }}
          >
            {message}
          </Alert>
        </Collapse>
      </Box>
    </Box>
  );
}
