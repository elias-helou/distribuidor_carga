"use client";
import { Box } from "@mui/material";
import DocentesView from "./components/DocentesView";
import { useGlobalContext } from "@/context/Global";
import {
  Atribuicao,
  Disciplina,
  Docente,
  Formulario,
} from "@/context/Global/utils";

function generateAtribuicoesMap(
  docentes: Docente[],
  turmas: Disciplina[],
  atribuicoes: Atribuicao[],
  formularios: Formulario[]
): Map<string, Disciplina[]> {
  const docentesMap = new Map<string, Disciplina[]>();

  for (const docente of docentes) {
    const atribuicoesDocente = atribuicoes.filter((a) =>
      a.docentes.includes(docente.nome)
    );

    const turmasDocente: Disciplina[] = [];
    for (const atribuicao of atribuicoesDocente) {
      const turma = structuredClone(
        turmas.find((t) => t.id === atribuicao.id_disciplina)
      );
      const formulario = formularios.find(
        (f) =>
          f.id_disciplina === atribuicao.id_disciplina &&
          f.nome_docente === docente.nome
      );
      turma.prioridade = !formulario ? 0 : formulario.prioridade;

      turmasDocente.push(turma);
    }
    docentesMap.set(docente.nome, turmasDocente);
  }

  return docentesMap;
}

function generateNaoAtribuidasMap(
  docentes: Docente[],
  turmas: Disciplina[],
  atribuicoes: Atribuicao[],
  formularios: Formulario[]
) {
  const docentesMap = new Map<string, Disciplina[]>();

  for (const docente of docentes) {
    const naoAtirbuidas: Disciplina[] = [];

    const idTurmaAtribuicoesDocente = atribuicoes
      .filter((a) => a.docentes.includes(docente.nome))
      .map((a) => a.id_disciplina);

    const formulariosTurmasNaoAtribuidas = formularios.filter(
      (f) =>
        !idTurmaAtribuicoesDocente.includes(f.id_disciplina) &&
        f.nome_docente === docente.nome
    );

    for (const formulario of formulariosTurmasNaoAtribuidas) {
      const turma = structuredClone(
        turmas.find((t) => t.id === formulario.id_disciplina)
      );
      if (!turma) {
        continue;
      }
      turma.prioridade = formulario.prioridade;

      turma.docentes = atribuicoes.find(
        (a) => a.id_disciplina === formulario.id_disciplina
      ).docentes;

      naoAtirbuidas.push(turma);
    }
    docentesMap.set(docente.nome, naoAtirbuidas);
  }

  return docentesMap;
}

export default function DocentesPage() {
  const {
    docentes,
    disciplinas,
    atribuicoes,
    formularios,
    updateAtribuicoesDocente,
    updateAtribuicoes,
  } = useGlobalContext();
  /**
   * Listar somente os docentes e turmas ativas
   */
  const docentesAtivos = docentes.filter((d) => d.ativo);
  const turmasAtivas = disciplinas.filter((d) => d.ativo);

  const onDeleteAtribuicao = (nome_docente: string, id_disciplina: string) => {
    updateAtribuicoesDocente(nome_docente, id_disciplina);
  };
  const onAddAtribuicao = (nome_docente: string, id_disciplina: string) => {
    const newAtribuicoes = [...atribuicoes];
    const atribuicao = newAtribuicoes.find(
      (a) => a.id_disciplina === id_disciplina
    );

    atribuicao.docentes = [nome_docente];
    updateAtribuicoes(newAtribuicoes);
  };

  const atribuicoesMap = generateAtribuicoesMap(
    docentesAtivos,
    turmasAtivas,
    atribuicoes,
    formularios
  );

  const naoAtribuidasMap = generateNaoAtribuidasMap(
    docentesAtivos,
    turmasAtivas,
    atribuicoes,
    formularios
  );

  return (
    <Box p={4}>
      <DocentesView
        docentes={docentesAtivos}
        atribuicoesMap={atribuicoesMap}
        onDeleteAtribuicao={onDeleteAtribuicao}
        naoAtribuidasMap={naoAtribuidasMap}
        onAddAtribuicao={onAddAtribuicao}
      />
    </Box>
  );
}
