import React from "react";
import { TableCell, Typography, Stack } from "@mui/material";
import { Disciplina } from "@/context/Global/utils";

interface HeaderCellProps {
  disciplina: Disciplina;
  onHeaderClick: (event: React.MouseEvent, disciplina: Disciplina) => void;
  setHeaderCollor: (id_disciplina: string) => string;
}

/**
 * Componente para cada disciplina no cabeçalho da tabela.
 */
const HeaderCell: React.FC<HeaderCellProps> = ({
  disciplina,
  onHeaderClick,
  setHeaderCollor,
}) => {
  /**
   * Cria o bloco referente aos horários de um adisicplina
   * @param disciplina Disciplina contendo os horários
   * @returns Componente React com os horários.
   */
  const createHorariosblock = (disciplina: Disciplina): React.ReactNode => {
    const horarios = disciplina.horarios ?? []; // Caso 'horarios' seja null ou undefined, usa um array vazio.

    return (
      <Typography
        align="left"
        variant="body1"
        style={{ fontSize: "small", whiteSpace: "pre-wrap" }}
      >
        Horário:
        {horarios.length > 0 ? (
          horarios.map((horario, index) =>
            horario ? (
              <span key={`${disciplina.nome}-${index}`}>
                <br />
                &emsp;{horario.dia} {horario.inicio}/{horario.fim}
              </span>
            ) : null
          )
        ) : (
          <span>
            <br />
            &emsp;A definir
          </span>
        )}
      </Typography>
    );
  };

  return (
    <TableCell
      key={disciplina.id}
      onClick={(event) => onHeaderClick(event, disciplina)}
      
      style={{
        backgroundColor: 'white',
        textOverflow: "ellipsis",
        margin: 0,
        minWidth: "12rem",
        maxWidth: "12rem",
        padding: 0,
      }} 
    >
        <Stack spacing={1} sx={{ height: "7rem", padding:'2px', backgroundColor: setHeaderCollor(disciplina.id) }}>
          <Typography
            align="left"
            variant="body1"
            style={{ fontWeight: "bold", fontSize: "12px" }}
            noWrap
            dangerouslySetInnerHTML={{
              __html: disciplina.cursos
                .replace(/^[^;]*;/, "")
                .replace(/<br\s*\/?>/gi, "")
                .replace(/&emsp;/gi, " "),
            }}
          />
          <Typography
            align="left"
            variant="body1"
            style={{ fontWeight: "bold", fontSize: "13px" }}
            noWrap
          >
            {disciplina.codigo + " " + disciplina.nome}
          </Typography>
          {createHorariosblock(disciplina)}
        </Stack>
    </TableCell>
  );
};

export default HeaderCell;
