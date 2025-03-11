import { Disciplina } from "@/context/Global/utils";
import { NeighborhoodFunction } from "../Classes/Abstract/NeighborhoodFunction";
import Constraint from "../Classes/Constraint";
import { Context, Vizinho } from "../Interfaces/utils";
import { compareArrays, podeAtribuir } from "./utils";

export class Swap extends NeighborhoodFunction {
  constructor(name: string, description: string | undefined) {
    super(name, description);
  }

  async generate(
    context: Context,
    hardConstraints: Map<string, Constraint>,
    baseSolution: Vizinho
  ): Promise<Vizinho[]> {
    const vizinhos: Vizinho[] = [];

    /**
     * Devemos percorrer a lista de turmas, uma vez para selecionar uma Pivot, e uma segunda vez para
     * selecionar a Atual.
     * A troca será realizada entre essas duas.
     */
    for (let i = 0; i < context.turmas.length; i++) {
      const turmaPivot: Disciplina = context.turmas[i];

      /**
       * Encontrar todos os docentes atribuídos a turma pivot.
       */
      const docentesPivot = baseSolution.atribuicoes.find(
        (atribuicao) => atribuicao.id_disciplina === turmaPivot.id
      ).docentes;

      for (let j = i + 1; j < context.turmas.length; j++) {
        const turmaAtual: Disciplina = context.turmas[j];
        /**
         * Encontrar todos os docentes atribuídos a turma atual.
         */
        const docentesAtual = baseSolution.atribuicoes.find(
          (atribuicao) => atribuicao.id_disciplina === turmaAtual.id
        ).docentes;

        /**
         * Caso ambas as turmas não tenham nenhuma atribuição, o processo deve ir para a próxima iteração.
         */
        // if (docentesAtual.length === 0 && docentesPivot.length === 0) {
        //   continue;
        // }

        /**
         * Remover depois
         */
        // if (turmaAtual.id === turmaPivot.id) {
        //   continue;
        // }

        /**
         * Verificar se a troca pode ser realizada: todos os docentes do Pivo podem ir para a Atual e vice-versa
         * */
        const trocaValida =
          docentesPivot.every((docente) =>
            podeAtribuir(
              context.docentes.find((d) => d.nome === docente),
              turmaAtual,
              context.travas,
              hardConstraints
            )
          ) &&
          docentesAtual.every((docente) =>
            podeAtribuir(
              context.docentes.find((d) => d.nome === docente),
              turmaPivot,
              context.travas,
              hardConstraints
            )
          ) &&
          !compareArrays(docentesPivot, docentesAtual);

        if (trocaValida) {
          const atribuicoes = structuredClone(baseSolution.atribuicoes);

          const atrib1 = atribuicoes.find(
            (a) => a.id_disciplina === turmaPivot.id
          );
          const atrib2 = atribuicoes.find(
            (a) => a.id_disciplina === turmaAtual.id
          );

          // Realizar a troca de docentes entre as duas disciplinas
          atrib1.docentes = docentesAtual;
          atrib2.docentes = docentesPivot;

          /**
           * Gera separadamente cada movimento em caso de troca de múltiplos docentes
           * (caso uam turma tenha 2 ou mais alocações).
           */
          const addMovimentos = [];
          for (const docente of docentesAtual) {
            addMovimentos.push([turmaPivot.id, docente]);
          }
          for (const docente of docentesPivot) {
            addMovimentos.push([turmaAtual.id, docente]);
          }

          const dropMovimentos = [];
          for (const docente of docentesPivot) {
            dropMovimentos.push([turmaPivot.id, docente]);
          }
          for (const docente of docentesAtual) {
            dropMovimentos.push([turmaAtual.id, docente]);
          }

          const vizinho: Vizinho = {
            atribuicoes: atribuicoes,
            isTabu: false,
            movimentos: { add: addMovimentos, drop: dropMovimentos },
          };

          vizinhos.push(vizinho);
        }
      }
    }

    return vizinhos;
  }
}
