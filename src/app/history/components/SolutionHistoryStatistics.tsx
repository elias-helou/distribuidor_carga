import LineChartsSelector from "@/components/SolutionHistoryStatistics/LineChartsSelector";
import { Disciplina, HistoricoSolucao, TipoTrava, Docente, getActiveFormularios } from "@/context/Global/utils";
import { Grid2, Paper, Typography } from "@mui/material";
import { getDisciplinasAtribuicoes, getDocentesAtribuicoes, processAtribuicoesToTree } from "../utils";
import DataTreeView from "@/components/SolutionHistoryStatistics/DataTreeView/DataTreeView";
import StatusPieChart from "@/components/SolutionHistoryStatistics/StatusPieChart";

/**
 * Interfaces para a exibição dos Docentes e Disciplinas
 */
export interface TreeDocente extends Docente {
  atribuicoes: Map<string, TreeDisciplina & {prioridade: number}>; // Id disciplina, TreeDisciplina
}

export interface TreeDisciplina extends Disciplina {
  formularios: Map<string, TreeDocente & {prioridade: number}>; // Nome docente, TreeDocente
  _cursos: string[]; // Será responsável por armazenar os nomes dos cursos sem os caracteres especiais
  atribuicoes: Map<string, TreeDocente & {prioridade: number|null}>; // Nome docente, TreeDocente
}



interface SolutionHistoryStatisticsProps {
  id: string;
  solucao: HistoricoSolucao;
  setHoveredCourese: React.Dispatch<React.SetStateAction<Disciplina>>;
}

const SolutionHistoryStatistics: React.FC<SolutionHistoryStatisticsProps> = ({
  id,
  solucao,
  setHoveredCourese
}) => {
  // Filtrando docentes ativos e obtendo suas atribuições
  const docentesAtribuicoes: Map<string, string[]> = getDocentesAtribuicoes(
    solucao.contexto.docentes.filter((docente) => docente.ativo),
    solucao.solucao.atribuicoes
  );


  /**
   * Disciplinas ainda não processadas
   */
  const disciplinasAtribuicoes: Map<string, string[]> = getDisciplinasAtribuicoes(
    solucao.contexto.disciplinas.filter((disciplina) => disciplina.ativo),
    solucao.solucao.atribuicoes
  );

  /**
   * Processa as informações
   */

  const atribuicoesProcessadas = processAtribuicoesToTree(disciplinasAtribuicoes, docentesAtribuicoes, 
    solucao.contexto.docentes, solucao.contexto.disciplinas, 
    getActiveFormularios(solucao.contexto.formularios, solucao.contexto.disciplinas, solucao.contexto.docentes))

  //const qtdDisciplinasAtivas: number = solucao.contexto.disciplinas.filter(disciplina => disciplina.ativo).length
  const qtdDocentesTravados: number = solucao.contexto.travas.filter(trava => trava.tipo_trava === TipoTrava.Row
    && docentesAtribuicoes.has(trava.nome_docente)
  ).length
  const qtdDisciplinasTravadas: number = solucao.contexto.travas.filter(trava => trava.tipo_trava === TipoTrava.Column
    && disciplinasAtribuicoes.has(trava.id_disciplina)
  ).length

  return (
  <Grid2 container spacing={2} key={`grid2_container_${id}`}>
    {/* Componente DataTreeView com as informações dos docentes e atribuições */}
    <Grid2 size={{xs: 12}}>
      <DataTreeView
        docentes={atribuicoesProcessadas.treeDocentes}
        //atribuicoes={solucao.solucao.atribuicoes}
        disciplinas={atribuicoesProcessadas.treeDisciplinas}
        solucao={solucao}
        setHoveredCourese={setHoveredCourese}
      />
    </Grid2>

    {/* Título e Gráficos de Relação Ativos X Inativos */}
    <Grid2 size={{xs: 12}}>
      <Typography variant="h6" gutterBottom align="center">
        Relação Ativos X Inativos
      </Typography>
    </Grid2>

    {/* Gráficos lado a lado dentro do Paper */}
    <Grid2 container size={{xs: 12}} spacing={2}>
      <Grid2 size={{xs: 12, md: 6}}>
        <Paper elevation={2} sx={{ padding: 2 }}>
          <StatusPieChart
            key="docentes_ativos_inativos"
            title="Relação Docentes"
            activeCount={docentesAtribuicoes.size}
            inactiveCount={solucao.contexto.docentes.length - docentesAtribuicoes.size}
            lockedCount={qtdDocentesTravados}
          />
        </Paper>
      </Grid2>

      <Grid2 size={{xs: 12, md: 6}}>
        <Paper elevation={2} sx={{ padding: 2 }}>
          <StatusPieChart
            key="disciplinas_ativos_inativos"
            title="Relação Disciplinas"
            activeCount={disciplinasAtribuicoes.size}
            inactiveCount={solucao.contexto.disciplinas.length - disciplinasAtribuicoes.size}
            lockedCount={qtdDisciplinasTravadas}
          />
        </Paper>
      </Grid2>
    </Grid2>

    {/* Renderizar o LineChartsSelector se as estatísticas estiverem disponíveis */}
    {solucao.solucao.estatisticas !== undefined && (
      <Grid2 size={{xs: 12}}>
        <LineChartsSelector solucao={solucao} />
      </Grid2>
    )}
  </Grid2>
);
};

export default SolutionHistoryStatistics;
