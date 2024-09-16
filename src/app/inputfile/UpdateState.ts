import { Atribuicao, Disciplina, Docente, Formulario } from "@/context/Global/utils";


type UpdateStateFunction<T> = (data: T[]) => void;

const selecionarArraysPorChaves = (
  obj: Record<string, any[]>,
  chaves: string[]
): Record<string, any[]> => {
  return chaves.reduce((resultado, chave) => {
    if (obj.hasOwnProperty(chave)) {
      resultado[chave] = obj[chave];
    }
    return resultado;
  }, {} as Record<string, any[]>);
};

// Função genérica para processar e atualizar estado
export const processAndUpdateState = <T>(
  jsonData: Record<string, any>,
  keys: string | string[],
  processor: (data: any) => T[],
  updateState: UpdateStateFunction<T>
) => {
  let data;

  if(Array.isArray(keys)) {
    data = selecionarArraysPorChaves(jsonData, keys);
  } else {
    data = jsonData[keys]
  }

  if (data) {
    const processedData = processor(data);
    updateState(processedData);
    return processedData;
  }

  return []
};

export const processDocentes = (data: any): Docente[] => {
  const saldos: Record<string, number> = data["saldos"];
  const docentesJson: string = data["docentes"];

  const newDocentes: Docente[] = [];

  if (saldos) {
    for (const [nome, saldo] of Object.entries(saldos)) {
      newDocentes.push({ nome:nome, saldo:saldo, ativo: true });
    }
  } else if (docentesJson) {
    for (const docente of docentesJson) {
      // Verificar depois com o Elias de adicionarmos o campo Ativo no arquivo exportado pelo nosso sistema
      newDocentes.push({ nome: docente, ativo: true });
    }
  }

  return newDocentes;
};

export const processDisciplinas = (data: Disciplina[]): Disciplina[] => {
  const disciplinasJson: Disciplina[] = data;
  const newDisciplinas: Disciplina[] = [];

  for (const disciplina of Object.values(disciplinasJson)) {
    newDisciplinas.push({
      codigo: disciplina.codigo,
      turma: disciplina.turma,
      nome: disciplina.nome,
      horario: disciplina.horario,
      cursos: disciplina.cursos,
      ementa: disciplina.ementa,
      id: disciplina.id,
      nivel: disciplina.nivel,
      prioridade: disciplina.prioridade,
      noturna: disciplina.noturna,
      ingles: disciplina.ingles,
      docentes: disciplina.docentes,
      ativo: true,
    });
  }

  return newDisciplinas;
};

export const processAtribuicoes = (data: Record<string, string[]>): Atribuicao[] => {
  const atribuicoesJson: Record<string, string[]> = data;
  const newAtribuicoes: Atribuicao[] = [];

  for (const [idDisciplina, docentes] of Object.entries(atribuicoesJson)) {
    newAtribuicoes.push({
      id_disciplina: idDisciplina,
      docentes: docentes,
    });
  }
  return newAtribuicoes;
};

export const processFormularios = (data: Record<string, Disciplina[]>): Formulario[] => {
  const formulariosJson: Record<string, Disciplina[]> = data;
  const newFormularios: Formulario[] = [];

  for (const [nome_professor, disciplinas] of Object.entries(formulariosJson) ) {
    for(const disciplina of Object.values(disciplinas)) {
      newFormularios.push({nome_professor: nome_professor, id_disciplina: disciplina.id, prioridade: disciplina.prioridade})
    }
  }

  return newFormularios
}