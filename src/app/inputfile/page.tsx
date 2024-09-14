"use client";

import {
  Button,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useState } from "react";
import {
  processAndUpdateState,
  processAtribuicoes,
  processDisciplinas,
  processDocentes,
  processFormularios,
} from "../inputfile/UpdateState";
import { useGlobalContext } from "@/context/Global";
import CustomAlert, { IAlertProps } from "@/components/CustomAlert";

export default function Teste() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState<IAlertProps|null>(null);
  const { setAtribuicoes, setDisciplinas, setDocentes, setFormularios } =
    useGlobalContext();

  const handleFileSelect = (files: FileList | null) => {
    // Verifica se realmente existe um arquivo
    if (files && files.length > 0) {
      const file = files[0];
      // Verifica se o arquivo é do tipo JSON
      if (file.type === "application/json") {
        setSelectedFile(file);
      } else {
        // Apresentar mensagem de erro na tela
        //console.log("Por favor, selecione um arquivo JSON.");
        setAlert({type: "warning", message: "Por favor, selecione um arquivo JSON."})
      }
    }
  };

  /**
   *  Carrega o arquivo JSON no state global
   * @param json Informações contidas no arquivo anteriormente lido
   */
  const loadContext = (json) => {
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

  // Importa os dados do arquivo para o state global
  const handleFileUpload = () => {
    if (selectedFile) {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          loadContext(json);
          setSelectedFile(null);
        } catch (error) {
          setAlert({type: "error", message: "Erro ao processar o arquivo JSON."})
        }
      };
      reader.readAsText(selectedFile);
    }
    setUploading(false);
    setAlert({type:"success", message: "Arquivo carregado com sucesso."})
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={4}
      border="1px solid #ccc"
      borderRadius={2}
      maxWidth={400}
      mx="auto"
      boxShadow={2}
    >
      <Typography variant="h6" gutterBottom>
        Upload de arquivo
      </Typography>

      <input
        accept="*"
        style={{ display: "none" }}
        id="file-input"
        type="file"
        onChange={(event) => handleFileSelect(event.target.files)}
        multiple={false}
      />
      <label htmlFor="file-input">
        <Button
          variant="outlined"
          color="primary"
          component="span"
          startIcon={<UploadFileIcon />}
          fullWidth
          style={{ marginBottom: 16 }}
        >
          Escolher Arquivo
        </Button>
      </label>

      {selectedFile && (
        <Typography variant="body1" gutterBottom>
          Arquivo Selecionado: {selectedFile.name}
        </Typography>
      )}

      <Button
        variant="contained"
        color="primary"
        startIcon={
          uploading ? <CircularProgress size={24} /> : <CloudUploadIcon />
        }
        onClick={handleFileUpload}
        disabled={!selectedFile} // Caso não tenha sido carregado um arquivo, o botão de carregar deve ser mantido desabilitado
        fullWidth
      >
        {uploading ? "Carregando..." : "Carregar Arquivo"}
      </Button>

      {/* Posicionando o CustomAlert na parte inferior direita */}
      {alert && (
        <Box position="fixed" bottom={16} right={16} zIndex={9999}>
          <CustomAlert type={alert.type} message={alert.message} setFatherState={() => setAlert(null)} />
        </Box>
      )}
    </Box>
  );
}
