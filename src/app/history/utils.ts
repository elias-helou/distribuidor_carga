import { Atribuicao, Docente } from "@/context/Global/utils";

/**
 * Função para contra quantas atribuições um docente ativo teve.
 * @param docentes 
 * @param atribuicoes 
 * @returns Retorna um Map com key sendo o nome do docente e value a quantidade de alocações para eles.
 */
export function getDocentesQtdAtribuicoes(docentes: Docente[], atribuicoes: Atribuicao[]): Map<string, number> {
    const qtdAtribuicoes = new Map<string, number>(); // nome, qtd

    for(const docente of docentes) {
        let qtd = 0;

        for(const atribuicao of atribuicoes) {
            if(atribuicao.docentes.includes(docente.nome)) {
                qtd += 1;
            }
        }

        qtdAtribuicoes.set(docente.nome, qtd)
    }

    return qtdAtribuicoes
}

export function getDocentesAtribuicoes(docentes: Docente[], atribuicoes: Atribuicao[]): Map<string, string[]> {
    const docentesAtribuicoes = new Map<string, string[]>(); // nome, qtd

    for(const docente of docentes) {
        const docenteAtribuicoes = [];

        for(const atribuicao of atribuicoes) {
            if(atribuicao.docentes.includes(docente.nome)) {
                docenteAtribuicoes.push(atribuicao.id_disciplina)
            }
        }

        docentesAtribuicoes.set(docente.nome, docenteAtribuicoes)
    }

    return docentesAtribuicoes
}