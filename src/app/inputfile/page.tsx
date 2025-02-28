"use client";

import { Button, Box, Typography, CircularProgress } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useState } from "react";
import {
  processAndUpdateState,
  processAtribuicoes,
  processDisciplinas,
  processDocentes,
  processFormularios,
  processSolucao,
  processTravas,
} from "../inputfile/UpdateState";
import { useGlobalContext } from "@/context/Global";
import {
  Atribuicao,
  Celula,
  Disciplina,
  Docente,
  Formulario,
  horariosSobrepoem,
} from "@/context/Global/utils";
import { useAlertsContext } from "@/context/Alerts";
import { useSolutionHistory } from "@/context/SolutionHistory/hooks";

export default function InputFileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { addAlerta } = useAlertsContext();
  const {
    setAtribuicoes,
    setDisciplinas,
    setDocentes,
    setFormularios,
    setTravas,
    setSolucaoAtual,
    setHistoricoSolucoes,
    historicoSolucoes,
  } = useGlobalContext();

  const { cleanSolucaoAtual } = useSolutionHistory();

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
        addAlerta("Por favor, selecione um arquivo JSON.", "warning");
      }
    }
  };

  /**
   * Função responsável por executar o processo de carregar as informações do arquivo para o state da aplicação.
   * @param json - Dados lidos do arquivo seletionado.
   */
  const loadContext = (json) => {
    const docentes: Docente[] = processAndUpdateState(
      json,
      ["docentes", "saldos"],
      processDocentes,
      setDocentes
    );
    const disciplinas: Disciplina[] = processAndUpdateState(
      json,
      "disciplinas",
      processDisciplinas,
      setDisciplinas
    );
    const atribuicoes: Atribuicao[] = processAndUpdateState(
      json,
      "atribuicao",
      processAtribuicoes,
      setAtribuicoes
    );
    const formularios: Formulario[] = processAndUpdateState(
      json,
      "formularios",
      processFormularios,
      setFormularios
    );

    const travas: Celula[] = processAndUpdateState(
      json,
      "travas",
      processTravas,
      setTravas
    );

    // Criar todas as disciplinas no state de atribuições
    if (atribuicoes.length != disciplinas.length) {
      for (const disciplina of disciplinas) {
        if (
          !atribuicoes.find(
            (atribuicao) => atribuicao.id_disciplina == disciplina.id
          )
        ) {
          atribuicoes.push({ id_disciplina: disciplina.id, docentes: [] });
        }
      }

      setAtribuicoes([...atribuicoes]);
    }

    // Preenche a lista de conflitos por disciplina
    // Vale ressaltar que, Horário de A e B conflitam, adicionar B em A e A em B, assim pode-se utilizar o j sendo i + 1 (próximo)
    for (let i = 0; i < disciplinas.length; i++) {
      for (let j = i + 1; j < disciplinas.length; j++) {
        for (const horarioPivo of disciplinas[i].horarios) {
          for (const horarioAtual of disciplinas[j].horarios) {
            if (horariosSobrepoem(horarioPivo, horarioAtual)) {
              disciplinas[i].conflitos.add(disciplinas[j].id);
              disciplinas[j].conflitos.add(disciplinas[i].id);
            }
          }
        }
      }
    }

    // Preenche a lista(Map) de formularios por docente.
    // O key e o value são os mesmo pois neste caso o importante é apenas a velocidade para acessar a informação em um Map
    for (const docente of docentes) {
      const docenteFormularios = formularios.filter(
        (formulario) => formulario.nome_docente === docente.nome
      );
      /*.map(formulario => formulario.id_disciplina)*/
      for (const docenteFormulario of docenteFormularios) {
        docente.formularios.set(
          docenteFormulario.id_disciplina,
          docenteFormulario.prioridade
        );
      }
    }

    /**
     * Processa solução e insere no histórico
     */
    if (json["solucao"]) {
      processSolucao(
        json["versao"],
        json["solucao"],
        atribuicoes,
        disciplinas,
        docentes,
        travas,
        historicoSolucoes,
        setHistoricoSolucoes,
        setSolucaoAtual,
        formularios
      );
    }
  };

  /**
   * Função que lê o arquivo enviado pelo usuário.
   */
  const handleFileUpload = () => {
    if (selectedFile) {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          loadContext(json);
          setSelectedFile(null);
          addAlerta(
            `Arquivo ${selectedFile.name} carregado com sucesso.`,
            "success"
          );
        } catch (error) {
          addAlerta("Erro ao processar o arquivo JSON.", "error");
        }
        setUploading(false);
      };
      reader.readAsText(selectedFile);
      cleanSolucaoAtual();
    }
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
      maxWidth={450}
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
    </Box>
  );
}
