import { Vizinho } from "@/TabuSearch/Interfaces/utils";

export abstract class TabuList<T> {
  protected itens: T;

  protected tabuSize: number | undefined;

  constructor(tabuSize: number | undefined) {
    this.tabuSize = tabuSize;

    this.itens = [] as T;
  }

  /**
   * Método que verifica se um vizinho está presente na lista tabu.
   * @param vizinho Vizinho que será verificado.
   * @returns `True` quando o vizinho estiver na lista tabu. `False` caso contrário.
   */
  abstract has(vizinho: Vizinho): boolean;

  /**
   * Método para remover um item pelo seu indice, ou também remover itens em um range.
   * @param index Índice do item a ser removido ou indice de começo.
   * @param indexEnd Índice final da lista de itens a serem removidos.
   */
  abstract remove(index: number, indexEnd?: number): T;

  /**
   * Método que adiciona um novo tabu a lista.
   * @param vizinho Vizinho que deverá ser adicionado a lista tabu.
   * @returns Retorna a nova lista tabu.
   * @description Esse método também valida se a lista tabu não excedeu o seu limite, e em casos
   * verdadeiros, realiza os processos para remover um item da lista.
   */
  abstract add(vizinho: Vizinho): T;
}
