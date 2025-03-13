"use client";

import { useParams } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid2,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import { useSolutionHistory } from "@/context/SolutionHistory/hooks";
import { BarChart, LineChart } from "@mui/x-charts";
import ConstraintsBarCharts from "./_components/ConstraintsBarCharts";
export default function SolutionDetails() {
  const { id } = useParams(); // Obtém o ID da URL
  const { historicoSolucoes } = useSolutionHistory(); // Obtém os dados do contexto

  // Busca a solução no histórico
  const solucao = historicoSolucoes.get(id as string);

  // Se a solução não for encontrada, exibe um erro
  if (!solucao) {
    return <Typography variant="h6">Solução não encontrada!</Typography>;
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
        <Box>
          {/* Título Principal */}
          <Typography variant="h4" gutterBottom align="center">
            Detalhes da Solução
          </Typography>

          {/* Informações Básicas */}
          <Card
            elevation={3}
            sx={{ padding: 2, borderRadius: 2, marginBottom: 2 }}
          >
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="body1">
                  <b>Data e Hora:</b> {solucao.datetime}
                </Typography>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="body1">
                  <b>Inserção:</b> {solucao.tipoInsercao}
                </Typography>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="body1">
                  <b>Interrompido:</b>{" "}
                  {solucao.solucao.estatisticas.interrupcao ? (
                    <Chip label="Sim" color="error" />
                  ) : (
                    <Chip label="Não" color="success" />
                  )}
                </Typography>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="body1">
                  <b>Avaliação:</b> {solucao.solucao.avaliacao}
                </Typography>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                <Tooltip
                  title={`${Math.floor(
                    solucao.solucao.estatisticas.tempoExecucao / 60000
                  )} min ${(
                    (solucao.solucao.estatisticas.tempoExecucao % 60000) /
                    1000
                  ).toFixed(3)} s`}
                  arrow
                >
                  <Typography variant="body1" sx={{ cursor: "help" }}>
                    <b>Tempo de Execução:</b>{" "}
                    {(
                      solucao.solucao.estatisticas.tempoExecucao / 1000
                    ).toFixed(3)}{" "}
                    s
                  </Typography>
                </Tooltip>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="body1">
                  <b>Iterações:</b> {solucao.solucao.estatisticas.iteracoes}
                </Typography>
              </Grid2>
            </Grid2>
          </Card>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Configurações do Algoritmo */}
        <Typography variant="h4" gutterBottom>
          Configurações
        </Typography>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Restrições</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid2 container spacing={2}>
              {[
                ...solucao.solucao.algorithm.constraints.hard.values(),
                ...solucao.solucao.algorithm.constraints.soft.values(),
              ].map((constraint) => (
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={constraint.name}>
                  <Card
                    elevation={3}
                    sx={{
                      padding: 2,
                      borderRadius: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      minHeight: 150,
                      textAlign: "center",
                      backgroundColor: constraint.isHard
                        ? "#ffebee"
                        : "#fff3cd",
                      border: constraint.isHard
                        ? "2px solid #d32f2f"
                        : "2px solid #ffb300",
                    }}
                  >
                    {constraint.isHard ? (
                      <ErrorOutlineIcon
                        color="error"
                        sx={{ fontSize: 40, marginBottom: 1 }}
                      />
                    ) : (
                      <TrendingDownOutlinedIcon
                        sx={{ fontSize: 40, marginBottom: 1, color: "#ffb300" }}
                      />
                    )}
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {constraint.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {constraint.isHard
                          ? "Restrição Hard (Obrigatória)"
                          : "Restrição Soft (Flexível)"}
                      </Typography>
                      {!constraint.isHard && (
                        <Typography
                          variant="body2"
                          color="error"
                          fontWeight="bold"
                        >
                          Penalidade: {constraint.penalty}
                        </Typography>
                      )}
                    </Box>
                  </Card>
                </Grid2>
              ))}
            </Grid2>
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 3 }} />

        {/* Seção de Gráficos */}
        <Typography variant="h4" gutterBottom>
          Gráficos
        </Typography>

        <Grid2 container spacing={3}>
          {/* Histograma de Prioridade - LINHA INTEIRA */}
          <Grid2 size={{ xs: 12 }}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" align="center" gutterBottom>
                  Histograma Quantidade de Atribuições por Prioridade
                </Typography>
                <BarChart
                  xAxis={[
                    {
                      scaleType: "band",
                      label: "Prioridades",
                      data: solucao.solucao.estatisticas.docentesPrioridade
                        .keys()
                        .toArray(),
                    },
                  ]}
                  series={[
                    {
                      label: "Prioridade",
                      data: solucao.solucao.estatisticas.docentesPrioridade
                        .values()
                        .toArray(),
                    },
                  ]}
                  height={300}
                  grid={{ vertical: false, horizontal: true }}
                  yAxis={[{ label: "Quantidade" }]}
                  margin={{ left: 75, right: 75 }}
                />
              </CardContent>
            </Card>
          </Grid2>

          {/* Gráficos menores */}
          <Grid2 size={{ xs: 12, md: 6 }}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" align="center" gutterBottom>
                  Gráfico Avaliação por Iteração
                </Typography>
                <LineChart
                  xAxis={[
                    {
                      data: solucao.solucao.estatisticas.avaliacaoPorIteracao
                        .keys()
                        .toArray(),
                      label: "Iteração",
                    },
                  ]}
                  series={[
                    {
                      data: solucao.solucao.estatisticas.avaliacaoPorIteracao
                        .values()
                        .toArray(),
                      label: "Avaliação",
                    },
                  ]}
                  grid={{ vertical: true, horizontal: true }}
                  height={300}
                  margin={{ left: 75, right: 75 }}
                />
              </CardContent>
            </Card>
          </Grid2>

          <Grid2 size={{ xs: 12, md: 6 }}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" align="center" gutterBottom>
                  Gráfico Tempo (s) por Iteração
                </Typography>
                <LineChart
                  xAxis={[
                    {
                      data: solucao.solucao.estatisticas.tempoPorIteracao
                        .keys()
                        .toArray(),
                      label: "Iteração",
                    },
                  ]}
                  series={[
                    {
                      data: solucao.solucao.estatisticas.tempoPorIteracao
                        .values()
                        .toArray()
                        .map((value) => value / 1000),
                      label: "Tempo (s)",
                    },
                  ]}
                  grid={{ vertical: true, horizontal: true }}
                  height={300}
                  margin={{ left: 75, right: 75 }}
                />
              </CardContent>
            </Card>
          </Grid2>

          {/* Histograma Ocorrências de Restrições - LINHA INTEIRA */}
          <Grid2 size={{ xs: 12 }}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" align="center" gutterBottom>
                  Histograma Ocorrências de Restrições
                </Typography>
                <ConstraintsBarCharts
                  ocorrencias={
                    solucao.solucao.estatisticas.qtdOcorrenciasRestricoes
                  }
                />
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>
      </Paper>
    </Box>
  );
}
