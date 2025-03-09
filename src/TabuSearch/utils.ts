/**
 * Função utilizada para aplciar uma pausa no processo.
 * @param {number} ms Valor em milissegundos.
 */
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
