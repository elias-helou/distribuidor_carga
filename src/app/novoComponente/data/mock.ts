// types.ts
export type Horario = {
  dia: string;
  inicio: string;
  fim: string;
};

export type Turma = {
  id: number;
  nome: string;
  codigo: string;
  turma: string;
  horarios: Horario[];
};

export type Docente = {
  id: number;
  nome: string;
};

export const docentes: Docente[] = [
  { id: 1, nome: "Ana Costa" },
  { id: 2, nome: "Bruno Lima" },
  { id: 3, nome: "Carla Mendes" },
  { id: 4, nome: "Daniel Souza" },
  { id: 5, nome: "Eduarda Ribeiro" },
];

export const turmasPorDocente: Record<number, Turma[]> = {
  1: [
    {
      id: 1,
      nome: "Matemática",
      codigo: "SME101",
      turma: "1",
      horarios: [
        { dia: "Segunda", inicio: "08:00", fim: "09:30" },
        { dia: "Quarta", inicio: "08:00", fim: "09:30" },
      ],
    },
    {
      id: 2,
      nome: "Física",
      codigo: "SME202",
      turma: "2",
      horarios: [{ dia: "Sexta", inicio: "10:00", fim: "11:30" }],
    },
  ],
  2: [
    {
      id: 3,
      nome: "Química",
      codigo: "SME303",
      turma: "1",
      horarios: [{ dia: "Terça", inicio: "13:00", fim: "14:30" }],
    },
  ],
  3: [
    {
      id: 4,
      nome: "Biologia",
      codigo: "SME404",
      turma: "3",
      horarios: [
        { dia: "Quarta", inicio: "10:00", fim: "11:30" },
        { dia: "Sexta", inicio: "10:00", fim: "11:30" },
      ],
    },
  ],
  4: [
    {
      id: 5,
      nome: "História",
      codigo: "SME505",
      turma: "1",
      horarios: [{ dia: "Segunda", inicio: "15:00", fim: "16:30" }],
    },
    {
      id: 6,
      nome: "Geografia",
      codigo: "SME606",
      turma: "2",
      horarios: [{ dia: "Quinta", inicio: "10:00", fim: "11:30" }],
    },
  ],
  5: [
    {
      id: 7,
      nome: "Português",
      codigo: "SME707",
      turma: "1",
      horarios: [{ dia: "Segunda", inicio: "08:00", fim: "09:30" }],
    },
  ],
};
