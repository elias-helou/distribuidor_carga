import { Box, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import TurmaItem from "./TurmaItem";
import SelectedTurma from "./SelectedTurma";
import { Disciplina } from "@/context/Global/utils";

type Props = {
  nome: string;
  turmas: Disciplina[];
  selecionado: boolean;
  onClick: () => void;
  onDeleteAtribuicao: (nome_docente: string, id_disciplina: string) => void;
  turmasNaoAtribuidas: Disciplina[];
  onAddAtribuicao: (nome_docente: string, id_disciplina: string) => void; // Lembrar que isso pode swapar
};

export default function DocenteRow({
  nome,
  turmas,
  selecionado,
  onClick,
  onDeleteAtribuicao,
}: Props) {
  return (
    <motion.div
      layout="size"
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px",
        cursor: "pointer",
        backgroundColor: selecionado ? "#e3f2fd" : "transparent",
        borderLeft: selecionado
          ? "4px solid #1976d2"
          : "4px solid rgba(0, 0, 0, 0.5)",

        borderBottom: selecionado
          ? "1px solid #1976d2"
          : "1px solid rgba(0, 0, 0, 0.5)",
        borderRadius: "4px",
      }}
    >
      <Box>
        <Typography
          variant="body1"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          width="11rem"
        >
          {nome}
        </Typography>
      </Box>
      <Stack direction="row" spacing={1}>
        {turmas.map((turma) =>
          selecionado ? (
            <SelectedTurma
              key={turma.id}
              nome={turma.nome}
              codigo={turma.codigo}
              turma={Number(turma.turma)}
              horarios={turma.horarios}
              // carga={0}
              curso={turma.cursos}
              ementa="www.google.com"
              id={turma.id}
              nivel={turma.nivel}
              noturna={turma.noturna}
              onRemove={() => {
                onDeleteAtribuicao(nome, turma.id);
              }}
              grupo="SME"
              prioridade={turma.prioridade}
            />
          ) : (
            <TurmaItem
              key={turma.id}
              nome={turma.nome}
              codigo={turma.codigo}
              turma={turma.turma}
              horarios={turma.horarios}
              destaque={false}
              // curso={turma.cursos}
              //prioridade={turma.prioridade}
            />
          )
        )}
      </Stack>
    </motion.div>
  );
  // const theme = useTheme();
  // return (
  //   <motion.tr
  //     layout="size"
  //     onClick={onClick}
  //     initial={{ opacity: 0 }}
  //     animate={{ opacity: 1 }}
  //     transition={{ duration: 0.1 }}
  //     style={{
  //       backgroundColor: selecionado
  //         ? theme.palette.action.hover
  //         : "transparent",
  //       borderLeft: selecionado ? "4px solid #1976d2" : "4px solid transparent",
  //       cursor: "pointer",
  //       display: "flex",
  //       alignItems: "center",
  //     }}
  //   >
  //     {/* Coluna do nome do docente */}
  //     <TableCell
  //       component="th"
  //       scope="row"
  //       sx={{
  //         minWidth: "10em",
  //         whiteSpace: "nowrap",
  //         overflow: "hidden",
  //         textOverflow: "ellipsis",
  //         fontWeight: selecionado ? "bold" : "normal",
  //       }}
  //     >
  //       {nome}
  //     </TableCell>

  //     {/* Coluna das turmas */}
  //     <Stack direction="row" spacing={1} flexWrap="nowrap">
  //       {turmas.map((turma) =>
  //         selecionado ? (
  //           <TableCell key={turma.id}>
  //             <SelectedTurma
  //               key={turma.id}
  //               nome={turma.nome}
  //               codigo={turma.codigo}
  //               turma={Number(turma.turma)}
  //               horarios={turma.horarios}
  //               carga={0}
  //               curso={turma.cursos}
  //               ementa="www.google.com"
  //               id={turma.id}
  //               nivel={turma.nivel}
  //               noturna={turma.noturna}
  //               onRemove={() => {
  //                 onDeleteAtribuicao(nome, turma.id);
  //               }}
  //               grupo="SME"
  //               prioridade={turma.prioridade}
  //             />
  //           </TableCell>
  //         ) : (
  //           <TableCell key={turma.id}>
  //             <TurmaItem
  //               key={turma.id}
  //               nome={turma.nome}
  //               codigo={turma.codigo}
  //               turma={turma.turma}
  //               horarios={turma.horarios}
  //               destaque={false}
  //             />
  //           </TableCell>
  //         )
  //       )}
  //     </Stack>
  //   </motion.tr>
  // );
}
