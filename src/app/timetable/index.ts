import { Celula } from "@/context/Global/utils";

/**
 * Função que define a colocação da célula na tabela
 * @param priority Prioridade dade por um docente a uma disciplina
 * @param maxPriority Maior valor encontrado no conjunto de prioridades.
 * @returns Uma `string` representando um RGBA.
 */
export function getPriorityColor(
  priority: number,
  maxPriority: number
): string {
  // Se a prioridade for null ou undefined, não altera a cor
  if (priority === null || priority === undefined) {
    return "inherit"; // 'inherit' mantém a cor original do elemento
  }

  // Define os componentes RGB da cor base (rgb(118, 196, 188))
  const baseRed = 118;
  const baseGreen = 196;
  const baseBlue = 188;

  // Variação mínima e máxima para intensificar ou clarear a cor
  const minFactor = 0.6; // Fator de escurecimento máximo (mais escuro)
  const maxFactor = 1.8; // Fator de clareamento máximo (mais claro)

  // Calcula o fator de ajuste da cor com base na prioridade
  const factor =
    maxFactor - ((priority - 1) / (maxPriority - 1)) * (maxFactor - minFactor);

  // Aplica o fator de ajuste aos componentes RGB
  const red = Math.floor(baseRed * factor);
  const green = Math.floor(baseGreen * factor);
  const blue = Math.floor(baseBlue * factor);

  // Retorna a cor ajustada em RGB
  return `rgba(${red}, ${green}, ${blue}, 0.8)`;
}


 /**
   * Função que define qual será a cor aplicada para cada célula da tabela.
   * @param {number|null|undefined} prioridade - Prioridade dada pelo docente a disciplina, ou nulo em caso de ser o cabeçalho.
   * @param {Celula} celula - Refere-se a célula que está sendo carregada.
   * @returns {string} Retorna um rgba para ser aplicado a propriedade css `background-color`.
   */
export function setCellColor(prioridade: number, celula: Celula, atribuido: boolean, maxPriority: number) {

  // Célula travada
  if(celula.trava) {
    return `rgba(224, 224, 224, 0.6)`; 
  }

  // Docente atribuido a Disciplina
  if(atribuido) {
    return `rgba(255, 0, 0, 0.4)`;
  }


  // O Docente apresentou uma prioridade para a Disciplina
  if(prioridade) {
    return getPriorityColor(prioridade, maxPriority);
  }

  return `rgba(255, 255, 255, 1)`;
}