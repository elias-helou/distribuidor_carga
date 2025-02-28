import { Solucao } from "@/context/Global/utils";
import { NeighborhoodFunction } from "../Classes/Abstract/NeighborhoodFunction";
import Constraint from "../Classes/Constraint";
import { Context, Vizinho } from "../Interfaces/utils";
import { podeAtribuir } from "./utils";

/**
 * O processo `Remove` é responsável por remover um docente de uma turma.
 * Caso não haja um docente, a vizinhança não deverá ser gerada. (Podemos testar remover essa opção)
 */
export class Remove extends NeighborhoodFunction {
  constructor(name: string, description: string | undefined) {
    super(name, description);
  }

  generate(
    context: Context,
    hardConstraints: Map<string, Constraint>,
    baseSolution: Solucao
  ): Vizinho[] {
    const vizinhos: Vizinho[] = [];
    for (const turma of context.turmas) {
      /**
       * Verifica se existia um docente atribuído para gerar a vizinhança vazia
       */
      if (turma.docentes.length == 0) {
        continue;
      }

      /**
       * Verificar se o movimento pode ser realizado através das restrições
       */
      if (!podeAtribuir(null, turma, context.travas, hardConstraints)) {
        continue;
      }

      /**
       * Gerar o movimento e armazenar as alterações
       */
      const solucaoAtual = structuredClone(baseSolution.atribuicoes);
      const atribuicao = solucaoAtual.find(
        (atribuicao) => atribuicao.id_disciplina === turma.id
      );

      atribuicao.docentes = [];

      /**
       * Gera separadamente cada movimento em caso de troca de múltiplos docentes
       * (caso uam turma tenha 2 ou mais alocações).
       */

      const dropMovimentos = [];
      for (const docente of turma.docentes) {
        dropMovimentos.push([turma.id, docente]);
      }

      const vizinho: Vizinho = {
        isTabu: false,
        movimentos: {
          add: [[turma.id, []]],
          drop: dropMovimentos,
        },
        atribuicoes: solucaoAtual,
      };

      vizinhos.push(vizinho);
    }

    return vizinhos;
  }
}
