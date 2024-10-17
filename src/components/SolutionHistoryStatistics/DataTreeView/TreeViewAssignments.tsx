import HeaderCell from "@/app/timetable/components/HeaderCell";
import { useGlobalContext } from "@/context/Global";
import React from "react";

// Props do DataTreeView
interface TreeViewAssignmentsProps {
  item: {tipo: string, id: string} | null; // Informação tratada {docente, nome_docente} ou {disciplina, id_disciplina}

}

const TreeViewAssignments: React.FC<TreeViewAssignmentsProps> = ({
  item
}) => {

  const {formularios, atribuicoes, disciplinas} = useGlobalContext()

  const renderAssignments = () => {
    const render = [];

    if(item.tipo === 'docente') {
      const docenteAtribuicoes = atribuicoes.filter(atribuicao => atribuicao.docentes.includes(item.id));
      const docenteAtribuicoesDisciplinas = [];

      for(const atribuicao of docenteAtribuicoes) {
        const disciplina = disciplinas.find(disc => disc.id === atribuicao.id_disciplina)
        docenteAtribuicoesDisciplinas.push(disciplina)
      }

      for(const disciplina of docenteAtribuicoesDisciplinas) {
        render.push(<HeaderCell disciplina={disciplina} onHeaderClick={(event, disciplina) => null} setHeaderCollor={(id: string) => 'white'}/>)
      }
    }

    return render;
  }

  return (
    <>
      {!item && (<span>Nenhum item selecionado</span>)}
      {item && (renderAssignments())}
    </>
  );
};

export default TreeViewAssignments;
