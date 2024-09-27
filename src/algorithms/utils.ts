import {
  Atribuicao,
} from "@/context/Global/utils";

export interface Solucao {
  atribuicoes: Atribuicao[];
  avaliacao: number;
}

// /**
//  * Função que transforma a `string` horário em um objeto.
//  * @param horario `String` original representando os horários de aula.
//  * @returns Uma lista da interface `Horario` contendo o(s) dia(s) de aula com horário de início e fim.
//  */
// function parseHorario(horario: string): Horario[] {
//   // Remove os caracteres de escape HTML e separa por <br>
//   const horariosLimpos = horario.replace(/<\/?[^>]+(>|$)/g, "").split("&emsp;");

//   const horarios: Horario[] = [];

//   horariosLimpos.forEach((horario) => {
//     // Verifica se a string contém dia e horário
//     const regex = /([\wÀ-ÿ]{3,4}\.)\s(\d{2}:\d{2})\/(\d{2}:\d{2})/;
//     const match = horario.match(regex);

//     if (match) {
//       const [, dia, inicio, fim] = match; // Extrai dia, horário de início e fim
//       horarios.push({ dia: dia as Horario["dia"], inicio, fim });
//     }
//   });

//   return horarios;
// }

// /**
//  * Função que executará a formatação dos horários de aulas das disciplinas.
//  * @param disciplinas Lista do tipo `DisciplinaETL` contendo todas as disciplinas que serão informadas no algoritmo.
//  * @returns Uma lista do tipo `Disciplina` contendo todos os ajustes nos horários.
//  */
// export function ajustaHorarioDisciplinas(
//   disciplinas: DisciplinaETL[]
// ): Disciplina[] {
//   const newDisciplinas: Disciplina[] = [];

//   // Para cada disciplina, verificar se o horário já está definido; se estiver, transformar a string no objeto da interface Horario
//   for (const disciplina of disciplinas) {
//     if (typeof disciplina.horario === "string") {
//       // Converte a string de horários para o objeto esperado
//       const horarios = parseHorario(disciplina.horario);

//       // Desestrutura o objeto e substitui o campo 'horarios'
//       const newDisciplina: Disciplina = {
//         ...disciplina,
//         horarios: horarios, // Atribui o novo valor de horários
//       };

//       // Adiciona a nova disciplina à lista
//       newDisciplinas.push(newDisciplina);
//     }
//   }

//   return newDisciplinas;
// }

// /**
//  * Função auxiliar para verificar se dois horários se sobrepõem
//  * @param horario1 Horário referente a disciplina 1
//  * @param horario2 Horário referente a disciplina 2
//  * @returns Booleano que indica se existe um conflito de horários entre as duas disciplinas.
//  */
// export function horariosSobrepoem(
//   horario1: Horario,
//   horario2: Horario
// ): boolean {
//   return (
//     horario1.dia === horario2.dia && // Mesmo dia
//     ((horario1.inicio < horario2.fim && horario1.fim > horario2.inicio) || // Sobreposição parcial ou total
//       horario1.inicio === horario2.fim || // Horários coincidentes (fim de uma é o início da outra)
//       horario1.fim === horario2.inicio)
//   );
// }

/**
 * Função para verificar igualdade entre duas atribuições.
 * @param atr1 Atribuição 1.
 * @param atr2 Atribuição 2.
 * @returns Booleano indicando se as atribuições são iguais.
 */
function atribuicoesIguais(atr1: Atribuicao, atr2: Atribuicao): boolean {
  return (
    atr1.id_disciplina === atr2.id_disciplina &&
    atr1.docentes.length === atr2.docentes.length &&
    atr1.docentes.every((docente, idx) => docente === atr2.docentes[idx])
  );
}

/**
 * Função para verificar se as atribuições do vizinho estão na lista tabu
 * @param listaTabu Lista com os N últimos conjuntos de atribuições realizadas.
 * @param atribuicoes Conjunto de novas atribuições geradas.
 * @returns Booleano que representa se o conjunto de atribuições já está na lista tabu.
 */
export function estaNaListaTabu(
  listaTabu: Atribuicao[][],
  atribuicoes: Atribuicao[]
): boolean {
  return listaTabu.some((tabuSet) =>
    // Verifica se todas as atribuições do conjunto estão na lista tabu
    atribuicoes.every((atr) =>
      tabuSet.some((tabu) => atribuicoesIguais(tabu, atr))
    )
  );
}

/**
 * Função para adicionar o conjunto de atribuições do melhor vizinho à lista tabu e manter o limite.
 * @param {Atribuicao[][]} listaTabu Lista com os N últimos conjuntos de atribuições realizadas.
 * @param {Atribuicao[]} atribuicoes Novo conjunto de atribuições realizadas.
 */
export function atualizarListaTabu(
  listaTabu: Atribuicao[][],
  atribuicoes: Atribuicao[]
): void {
  listaTabu.push(atribuicoes); // Adiciona o novo conjunto de atribuições à lista tabu

  // Verifica o limite da lista tabu e remove o conjunto mais antigo, se necessário
  if (listaTabu.length > 10) {
    listaTabu.shift(); // Remove o conjunto mais antigo para manter o limite de 10
  }
}
