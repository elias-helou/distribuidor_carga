"use client";

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
import { BarChart, LineChart } from "@mui/x-charts";
import ConstraintsBarCharts from "./ConstraintsBarCharts";
import { HistoricoSolucao } from "@/context/Global/utils";
import { IteracoesSemModificacao } from "@/TabuSearch/StopCriteria/IteracoesSemModificacao";
import { IteracoesMaximas } from "@/TabuSearch/StopCriteria/IteracoesMaximas";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ShuffleOutlinedIcon from "@mui/icons-material/ShuffleOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import ShutterSpeedOutlinedIcon from "@mui/icons-material/ShutterSpeedOutlined";
import PauseCircleOutlineOutlinedIcon from "@mui/icons-material/PauseCircleOutlineOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";

export default function SolutionHistoryDetails({
  solucao,
}: {
  solucao: HistoricoSolucao;
}) {
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
            <Typography variant="h6">Parâmetros Globais</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key="tabuList">
                <Card
                  elevation={3}
                  sx={{
                    padding: 2,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minHeight: 100,
                    textAlign: "center",
                    backgroundColor: "#e3f2fd",
                    border: "2px solid #1976d2",
                  }}
                >
                  <Tooltip title="Define a quantidade máxima de elementos armazenados na lista tabu.">
                    <InfoOutlinedIcon
                      color="primary"
                      sx={{ fontSize: 40, marginRight: 2 }}
                    />
                  </Tooltip>
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      Tamanho da Lista Tabu
                    </Typography>
                    <Typography variant="h5" color="primary">
                      {solucao.solucao.algorithm.tabuList.tabuSize}
                    </Typography>
                  </Box>
                </Card>
              </Grid2>
            </Grid2>
          </AccordionDetails>
        </Accordion>

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
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Geração da Vizinhança</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid2 container spacing={2}>
              {Array.from(
                solucao.solucao.algorithm.neighborhoodPipe.values()
              ).map((genFunc) => (
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={genFunc.name}>
                  <Card
                    elevation={3}
                    sx={{
                      padding: 2,
                      borderRadius: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 150,
                      textAlign: "center",
                      backgroundColor: "#fff3e0",
                      border: "2px solid #ff9800",
                    }}
                  >
                    <ShuffleOutlinedIcon
                      color="warning"
                      sx={{ fontSize: 40, marginBottom: 1 }}
                    />
                    <Typography variant="body1" fontWeight="bold">
                      {genFunc.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {genFunc.description}
                    </Typography>
                  </Card>
                </Grid2>
              ))}
            </Grid2>
          </AccordionDetails>
        </Accordion>

        {/**Interrupção */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Interrupção</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid2 container spacing={2}>
              {Array.from(solucao.solucao.algorithm.stopPipe.values()).map(
                (stopFunc) => {
                  let details = null;
                  let icon = (
                    <PauseCircleOutlineOutlinedIcon
                      color="warning"
                      sx={{ fontSize: 40, marginBottom: 1 }}
                    />
                  );

                  if (stopFunc instanceof IteracoesSemModificacao) {
                    details = `Iterações sem modificação: ${stopFunc.limiteIteracoesSemModificacao}`;
                    icon = (
                      <ShutterSpeedOutlinedIcon
                        color="warning"
                        sx={{ fontSize: 40, marginBottom: 1 }}
                      />
                    );
                  } else if (stopFunc instanceof IteracoesMaximas) {
                    details = `Quantidade máxima de iterações: ${stopFunc.maxIteracoes}`;
                    icon = (
                      <TimerOutlinedIcon
                        color="error"
                        sx={{ fontSize: 40, marginBottom: 1 }}
                      />
                    );
                  }

                  return (
                    <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={stopFunc.name}>
                      <Card
                        elevation={3}
                        sx={{
                          padding: 2,
                          borderRadius: 2,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          minHeight: 150,
                          textAlign: "center",
                          backgroundColor: "#e3f2fd",
                          border: "2px solid #1976d2",
                        }}
                      >
                        {icon}
                        <Typography variant="body1" fontWeight="bold">
                          {stopFunc.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {stopFunc.description}
                        </Typography>
                        {details && (
                          <Typography
                            variant="body2"
                            color="error"
                            fontWeight="bold"
                          >
                            {details}
                          </Typography>
                        )}
                      </Card>
                    </Grid2>
                  );
                }
              )}
            </Grid2>
          </AccordionDetails>
        </Accordion>

        {/**Aspiração */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Critérios de Aspiração</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid2 container spacing={2}>
              {Array.from(
                solucao.solucao.algorithm.aspirationPipe.values()
              ).map((aspirationFunc) => (
                <Grid2
                  size={{ xs: 12, sm: 6, md: 4 }}
                  key={aspirationFunc.name}
                >
                  <Card
                    elevation={3}
                    sx={{
                      padding: 2,
                      borderRadius: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 150,
                      textAlign: "center",
                      backgroundColor: "#e8f5e9",
                      border: "2px solid #2e7d32",
                    }}
                  >
                    <CheckCircleOutlineOutlinedIcon
                      color="success"
                      sx={{ fontSize: 40, marginBottom: 1 }}
                    />
                    <Typography variant="body1" fontWeight="bold">
                      {aspirationFunc.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {aspirationFunc.description}
                    </Typography>
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
                      data: Array.from(
                        solucao.solucao.estatisticas.docentesPrioridade.keys()
                      ),
                    },
                  ]}
                  series={[
                    {
                      label: "Prioridade",
                      data: Array.from(
                        solucao.solucao.estatisticas.docentesPrioridade.values()
                      ),
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
                      data: Array.from(
                        solucao.solucao.estatisticas.avaliacaoPorIteracao.keys()
                      ),
                      label: "Iteração",
                    },
                  ]}
                  series={[
                    {
                      data: Array.from(
                        solucao.solucao.estatisticas.avaliacaoPorIteracao.values()
                      ),
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
                      data: Array.from(
                        solucao.solucao.estatisticas.tempoPorIteracao.keys()
                      ),
                      label: "Iteração",
                    },
                  ]}
                  series={[
                    {
                      data: Array.from(
                        solucao.solucao.estatisticas.tempoPorIteracao.values()
                      ).map((value) => value / 1000),
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
