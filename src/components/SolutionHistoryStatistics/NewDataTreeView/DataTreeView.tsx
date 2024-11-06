import {
  TreeDisciplina,
  TreeDocente,
} from "@/app/history/components/SolutionHistoryStatistics";
import { Grid2, Paper } from "@mui/material";
import DocenteTreeView from "./DocentesTreeView";
import DisciplinasTreeView from "./DisciplinasTreeView";
import { useState } from "react";
import { FormulariosView } from "./FormulariosView";
import { HistoricoSolucao } from "@/context/Global/utils";
import { ArtribuicoesView } from "./ArtribuicoesView";

export interface DataTreeViewProps {
  docentes: Map<string, TreeDocente>;
  disciplinas: Map<string, TreeDisciplina>;
  solucao: HistoricoSolucao;
  setHoveredCourese: React.Dispatch<React.SetStateAction<TreeDisciplina | null>>;
}

export default function NewDataTreeView({
  docentes,
  disciplinas,
  solucao,
  setHoveredCourese
}: DataTreeViewProps) {
  const [lastClickedItem, setLastClickedItem] = useState<{
    tipo: "docente" | "disciplina" | null;
    id: string;
  } | null>(null);

  /**
   * Exemplo:
   *  - Docente: ['item', 'docente', 'José Bieco']
   *  - Disciplina dentro do Docente: ['child', 'docente', 'José Bieco', 'disciplina', 'SME0284,1']
   *
   *  - Disciplina: ['item', 'disciplina', 'SME0284,1']
   * - Docente dentro da Disciplina: ['child', 'disciplina', 'SME0284,1', 'docente', 'José Bieco']
   */
  const handleLastClickedItem = (itemId: string) => {
    if (itemId !== "0") {
      const tokens = itemId.split("_");
      if (tokens[0] === "item") {
        setLastClickedItem({
          tipo: tokens[1] as "docente" | "disciplina",
          id: tokens[2],
        });
      } else {
        setLastClickedItem({
          tipo: tokens[3] as "docente" | "disciplina",
          id: tokens[4],
        });
      }
    } else {
      setLastClickedItem({tipo: null, id: null})
    }
  };

  const selecionaEntidade = (tipo: "docente" | "disciplina", id: string) => {
    return tipo === "docente" ? docentes.get(id) : disciplinas.get(id);
  };

  return (
    <Grid2 container size={{ xs: 12 }} spacing={2}>
      <Grid2 size={{ xs: 12, md: 6 }}>
        <Paper elevation={2} sx={{ padding: 2 }}>
          <DocenteTreeView
            docentes={docentes}
            handleClickedItem={handleLastClickedItem}
          />
        </Paper>
      </Grid2>
      <Grid2 size={{ xs: 12, md: 6 }}>
        <Paper elevation={2} sx={{ padding: 2 }}>
          <DisciplinasTreeView
            disciplinas={disciplinas}
            handleClickedItem={handleLastClickedItem}
          />
        </Paper>
      </Grid2>
      <Grid2 size={{ xs: 12, md: 6 }}>
        <Paper elevation={2} sx={{ padding: 2 }}>
          <FormulariosView
            tipo={lastClickedItem?.tipo}
            id={lastClickedItem?.id}
            entidade={selecionaEntidade(
              lastClickedItem?.tipo,
              lastClickedItem?.id
            )}
            solucao={solucao}
            disciplinas={disciplinas}
            docentes={docentes}
            setHoveredCourese={setHoveredCourese}
          />
        </Paper>
      </Grid2>
      <Grid2 size={{ xs: 12, md: 6 }}>
        <Paper elevation={2} sx={{ padding: 2 }}>
          <ArtribuicoesView
            tipo={lastClickedItem?.tipo}
            id={lastClickedItem?.id}
            entidade={selecionaEntidade(
              lastClickedItem?.tipo,
              lastClickedItem?.id
            )}
            solucao={solucao}
            disciplinas={disciplinas}
            setHoveredCourese={setHoveredCourese}
          />
        </Paper>
      </Grid2>
    </Grid2>
  );
}
