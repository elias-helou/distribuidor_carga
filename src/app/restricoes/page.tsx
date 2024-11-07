"use client";

import React, { useState } from "react";
import { Button, Container, Grid2, Typography } from "@mui/material";
import ConstraintCard from "@/components/Constraints/ConstraintCard";
import Constraint from "@/classes/Constraint";
import { useAlgorithmContext } from "@/context/Algorithm";

export interface ConstraintInterface {
  name: string;
  tipo: "Hard" | "Soft";
  penalidade: string;
  descricao: string;
  constraint: new (...args: any[]) => Constraint;
}

// const initialConstraints: ConstraintInterface[] = [
//   {
//     name: "Disciplina sem docente",
//     tipo: "Hard",
//     penalidade: "10",
//     descricao: "",
//     constraint: DisciplinaSemDocente,
//   },
//   {
//     name: "Choque de horários",
//     tipo: "Soft",
//     penalidade: "100",
//     descricao:
//       "Essa restrição verifica se os docentes foram atribuídos a disciplinas que ocorrem ao mesmo tempo ou apresentam conflitos de início e fim de aula.",
//     constraint: ChoqueDeHorarios,
//   },
//   {
//     name: "Atribuição sem formulário",
//     tipo: "Hard",
//     penalidade: "0",
//     descricao:
//       "Essa restrição verifica se o docente preencheu o formulário para as disciplinas que foi atribuído",
//     constraint: AtribuicaoSemFormulario,
//   },
//   // {
//   //   name:,
//   //   tipo:,
//   //   penalidade:,
//   //   descricao:,
//   //   constraint:
//   // }
//   //{ name: "Disciplina com sobreposição", tipo: "Soft", penalidade: "5" },
//   // Adicione outras restrições conforme necessário
// ];

export default function Restricoes() {
  const {
    hardConstraints,
    softConstraints,
    setHardConstraints,
    setSoftConstraints,
  } = useAlgorithmContext();
  const stateConstraints: ConstraintInterface[] = [];
  hardConstraints.forEach((value) => stateConstraints.push(value.toObject()));
  softConstraints.forEach((value) => stateConstraints.push(value.toObject()));

  const [constraints, setConstraints] =
    useState<ConstraintInterface[]>(stateConstraints);
  // const [constraints, setConstraints] = useState(
  //   new Map([...hardConstraints, ...softConstraints])
  // );

  const handleConstraintChange = (
    name: string,
    newTipo: "Hard" | "Soft",
    newPenalidade: string
  ) => {
    setConstraints((prevConstraints) =>
      prevConstraints.map((constraint) =>
        constraint.name === name
          ? { ...constraint, tipo: newTipo, penalidade: newPenalidade }
          : constraint
      )
    );
  };

  const removeConstraint = (name: string, tipo: string, penalidade: string) => {
    const newConstraints = constraints.filter(
      (constraint) =>
        constraint.name !== name &&
        constraint.tipo !== tipo &&
        constraint.penalidade !== penalidade
    );

    setConstraints(newConstraints);
  };

  const saveConstraints = (constraints: ConstraintInterface[]) => {
    const newSoftConstraints = new Map<string, Constraint>();
    const newHardConstraints = new Map<string, Constraint>();

    for (const constraint of constraints) {
      if (constraint.tipo === "Hard") {
        const hardConstraint = new constraint.constraint(
          constraint.name,
          constraint.descricao,
          true,
          constraint.penalidade
        );
        newHardConstraints.set(constraint.name, hardConstraint);
      } else {
        const softConstraint = new constraint.constraint(
          constraint.name,
          constraint.descricao,
          false,
          constraint.penalidade
        );

        newSoftConstraints.set(constraint.name, softConstraint);
      }
    }

    setSoftConstraints(newSoftConstraints);
    setHardConstraints(newHardConstraints);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid2 container spacing={3} alignItems="center" justifyContent="center">
        <Grid2 size={12}>
          <Typography variant="h4" align="center" color="text.secondary">
            Ajuste as configurações para definir as restrições
          </Typography>
        </Grid2>
        {constraints.map((constraint) => (
          <ConstraintCard
            key={constraint.name}
            name={constraint.name}
            tipoInicial={constraint.tipo}
            penalidadeInicial={constraint.penalidade}
            descricao={constraint.descricao}
            onChange={handleConstraintChange}
            onDelete={removeConstraint}
          />
        ))}

        <Grid2
          size={12}
          alignItems="right"
          justifyContent="right"
          justifyItems="right"
          alignContent="right"
          textAlign="right"
        >
          <Button
            variant="contained"
            onClick={() => saveConstraints(constraints)}
          >
            Salvar
          </Button>
        </Grid2>
      </Grid2>
    </Container>
  );
}
