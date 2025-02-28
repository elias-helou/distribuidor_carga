import Constraint, {
  AtribuicaoSemFormulario,
  CargaDeTrabalho,
  ChoqueDeHorarios,
  DisciplinaSemDocente,
} from "@/TabuSearch/Classes/Constraint";
import { createContext, useContext, useState } from "react";

export interface AlgorithmInterface {
  hardConstraints: Map<string, Constraint>;
  softConstraints: Map<string, Constraint>;
  setHardConstraints: React.Dispatch<
    React.SetStateAction<Map<string, Constraint>>
  >;
  setSoftConstraints: React.Dispatch<
    React.SetStateAction<Map<string, Constraint>>
  >;
  allConstraints: Map<string, Constraint>;
  setAllConstraints: React.Dispatch<
    React.SetStateAction<Map<string, Constraint>>
  >;
}

const AlgorithmContext = createContext<AlgorithmInterface>({
  hardConstraints: new Map<string, Constraint>(),
  softConstraints: new Map<string, Constraint>(),
  setHardConstraints: () => Map<string, Constraint>,
  setSoftConstraints: () => Map<string, Constraint>,
  allConstraints: new Map<string, Constraint>(),
  setAllConstraints: () => Map<string, Constraint>,
});

export function AlgorithmWrapper({ children }: { children: React.ReactNode }) {
  const [hardConstraints, setHardConstraints] = useState(
    new Map<string, Constraint>([
      [
        "Atribuição sem formulário",
        new AtribuicaoSemFormulario(
          "Atribuição sem formulário",
          "Essa restrição verifica se o docente preencheu o formulário para as disciplinas que foi atribuído.",
          true,
          0
        ),
      ],
    ])
  );
  const [softConstraints, setSoftConstraints] = useState(
    new Map<string, Constraint>([
      [
        "Disciplina sem docente",
        new DisciplinaSemDocente("Disciplina sem docente", "", false, 10000),
      ],
      [
        "Choque de horários",
        new ChoqueDeHorarios(
          "Choque de horários",
          "Essa restrição verifica se os docentes foram atribuídos a disciplinas que ocorrem ao mesmo tempo ou apresentam conflitos de início e fim de aula.",
          false,
          100000
        ),
      ],
      [
        "Carga de Trabalho",
        new CargaDeTrabalho(
          "Carga de Trabalho",
          "Essa restrição tem como objetivo incentivar a atribuição de turmas a docentes com saldos negativos, atribuíndo uma maior penalização para eles, como também, desincentivar a atribuição de muitas turmas para docentes com saldos positivos.",
          false,
          1000
        ),
      ],
      // Adicione outras restrições conforme necessário
    ])
  );

  const [allConstraints, setAllConstraints] = useState(
    new Map([...softConstraints, ...hardConstraints])
  );

  return (
    <AlgorithmContext.Provider
      value={{
        hardConstraints: hardConstraints,
        softConstraints: softConstraints,
        setHardConstraints: setHardConstraints,
        setSoftConstraints: setSoftConstraints,
        allConstraints: allConstraints,
        setAllConstraints: setAllConstraints,
      }}
    >
      {children}
    </AlgorithmContext.Provider>
  );
}

export function useAlgorithmContext() {
  return useContext(AlgorithmContext);
}
