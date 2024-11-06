"use client";

import React, { useState } from "react";
import { Container, Grid2, Typography } from "@mui/material";
import ConstraintCard from "@/components/Constraints/ConstraintCard";

export interface ConstraintInterface {
  name: string;
  tipo: string;
  penalidade: string;
}

const initialConstraints: ConstraintInterface[] = [
  { name: "Disciplina sem docente", tipo: "Hard", penalidade: "10" },
  { name: "Disciplina com sobreposição", tipo: "Soft", penalidade: "5" },
  // Adicione outras restrições conforme necessário
];

export default function Restricoes() {
  const [constraints, setConstraints] = useState(initialConstraints);

  const handleConstraintChange = (
    name: string,
    newTipo: string,
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
            onChange={handleConstraintChange}
            onDelete={removeConstraint}
          />
        ))}
      </Grid2>
    </Container>
  );
}
