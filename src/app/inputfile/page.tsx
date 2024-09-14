"use client";

import {
  Button,
  Box,
  Typography,
  CircularProgress,
  Stack,
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

export default function InputFileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [alerts, setAlerts] = useState<IAlertProps[]>([]); // Agora é um array de alertas
  const { setAtribuicoes, setDisciplinas, setDocentes, setFormularios } =
    useGlobalContext();

  /**
   * Função responsável por validar se um arquivo foi selecionado e se é do tipo permitido.
   * @param files Arquivo enviado pelo usuário.
   */
  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "application/json") {
        setSelectedFile(file);
      } else {
        addAlert({
          id: alerts.length + 1,
          type: "warning",
          message: "Por favor, selecione um arquivo JSON.",
        });
      }
    }
  };

  const loadContext = (json) => {
    processAndUpdateState(
      json,
      ["docentes", "saldos"],
      processDocentes,
      setDocentes
    );
    processAndUpdateState(
      json,
      "disciplinas",
      processDisciplinas,
      setDisciplinas
    );
    processAndUpdateState(
      json,
      "atribuicao",
      processAtribuicoes,
      setAtribuicoes
    );
    processAndUpdateState(
      json,
      "formularios",
      processFormularios,
      setFormularios
    );
  };

  const handleFileUpload = () => {
    if (selectedFile) {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          loadContext(json);
          setSelectedFile(null);
          addAlert({
            id: alerts.length + 1,
            type: "success",
            message: "Arquivo carregado com sucesso.",
          });
        } catch (error) {
          addAlert({
            id: alerts.length + 1,
            type: "error",
            message: "Erro ao processar o arquivo JSON.",
          });
        }
        setUploading(false);
      };
      reader.readAsText(selectedFile);
    }
  };

  /**
   * Função que adiciona um novo alerta no state.
   * @param newAlert Novo objeto a ser inserido no state de alertas.
   */
  const addAlert = (newAlert: IAlertProps) => {
    setAlerts([...alerts, newAlert]); // Adiciona novo alerta ao array
  };

  /**
   * Remove um objeto do state de alertas.
   * @param index Index do objeto dentro do state.
   */
  const removeAlert = (index: number) => {
    const newAlerts = alerts.filter((alert) => alert.id !== index);
    setAlerts([...newAlerts]);
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
          variant={!selectedFile ? "contained" : "outlined"}
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
        disabled={!selectedFile} // Desabilita o botão caso nenhum arquivo tenha sido selecionado
        fullWidth
      >
        {uploading ? "Carregando..." : "Carregar Arquivo"}
      </Button>

      {/* Exibindo os alertas na parte inferior direita */}
      {alerts.length > 0 && (
        <Stack
          position="fixed"
          bottom={16}
          right={16}
          zIndex={9999}
          spacing={1}
        >
          {alerts.map((alert) => (
            <CustomAlert
              key={alert.id}
              type={alert.type}
              message={alert.message}
              id={alert.id}
              setFatherState={() => removeAlert(alert.id)} // Remove o alerta quando for fechado
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
