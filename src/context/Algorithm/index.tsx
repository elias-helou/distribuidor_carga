import Constraint, {
  AtribuicaoSemFormulario,
  ChoqueDeHorarios,
  DisciplinaSemDocente,
} from "@/classes/Constraint";
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
}

const AlgorithmContext = createContext<AlgorithmInterface>({
  hardConstraints: new Map<string, Constraint>(),
  softConstraints: new Map<string, Constraint>(),
  setHardConstraints: () => Map<string, Constraint>,
  setSoftConstraints: () => Map<string, Constraint>,
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
        new DisciplinaSemDocente("Disciplina sem docente", "", false, 100),
      ],
      [
        "Choque de horários",
        new ChoqueDeHorarios(
          "Choque de horários",
          "Essa restrição verifica se os docentes foram atribuídos a disciplinas que ocorrem ao mesmo tempo ou apresentam conflitos de início e fim de aula.",
          false,
          1000
        ),
      ],
      // Adicione outras restrições conforme necessário
    ])
  );

  return (
    <AlgorithmContext.Provider
      value={{
        hardConstraints: hardConstraints,
        softConstraints: softConstraints,
        setHardConstraints: setHardConstraints,
        setSoftConstraints: setSoftConstraints,
      }}
    >
      {children}
    </AlgorithmContext.Provider>
  );
}

export function useAlgorithmContext() {
  return useContext(AlgorithmContext);
}
