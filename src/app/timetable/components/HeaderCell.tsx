import React, { useState } from "react";
import { TableCell, Typography, Stack, styled } from "@mui/material";
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

  // Estado para armazenar qual célula está sendo hover
  const [hoveredCellId, setHoveredCellId] = useState<string | null>(null);

  // Funções de hover
  const handleMouseEnter = (id: string) => {
    setHoveredCellId(id);
  };

  const handleMouseLeave = () => {
    setHoveredCellId(null);
  };

  // StyledTableCell com estilos dinâmicos baseado no hover
  const StyledStack = styled(Stack)<{ id: string }>(({ id }) => ({
    position: "relative",
    zIndex: 1,
    overflow: "hidden", // Inicialmente corta o texto
    textOverflow: "ellipsis", // Aplica o ellipsis no texto longo
    whiteSpace: "nowrap", // Força o texto a ficar em uma linha
    minWidth: "12rem", // Define o tamanho inicial
    maxWidth: "12rem", // Define o tamanho inicial
    height: "8rem", // Altura padrão
    backgroundColor: setHeaderCollor(id),
    transition: "max-width 0.3s ease, height 0.3s ease", // Transições suaves de largura e altura
    padding: 0, margin: 0,

    // Estilos no estado de hover
    "&:hover": {
      overflow: "visible", // Permite que o conteúdo seja exibido
      whiteSpace: "normal", // Permite o texto quebrar em várias linhas
      maxWidth: "50rem", // Expande a largura máxima no hover
      //height: "auto", // Permite que a altura se ajuste conforme necessário
      transition: "max-width 0.3s ease, height 0.3s ease", // Transições suaves
    },
  }));

  const getTypographyStyle = (id: string) => ({
    whiteSpace: "nowrap", // Quebra a linha apenas no hover
    overflow: "hidden", // Mostra o texto completo no hover
    textOverflow: "ellipsis", // Remove o ellipsis no hover
    fontSize: hoveredCellId === id ? "14px" : "12px", // Aumenta a fonte no hover
    transition: "all 0.3s ease", // Transição suave
    paddingTop: "2px", // Adiciona padding-top quando hover
  });

  return (
    <TableCell
      key={disciplina.id}
      onClick={(event) => onHeaderClick(event, disciplina)}
      onMouseEnter={() => handleMouseEnter(disciplina.id)} // Ativa o hover
      onMouseLeave={handleMouseLeave} // Desativa o hover
      style={{
        backgroundColor: "white",
        margin: 0,
        padding: 0,
      }}
    >
      <StyledStack
        id={disciplina.id}
        spacing={1}
        className="stack-style"
        //sx={{...getStackStyle(disciplina.id)}} // Aplica os estilos dinâmicos ao Stack
      >
        <Typography
          align="left"
          variant="body1"
          style={{ fontWeight: "bold", ...getTypographyStyle(disciplina.id) }} // Aplica estilos dinâmicos
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
          style={{
            fontWeight: "bold",
            fontSize: "13px",
            ...getTypographyStyle(disciplina.id),
          }} // Estilos dinâmicos
        >
          {disciplina.codigo + " " + disciplina.nome}
        </Typography>
        {createHorariosblock(disciplina)}
      </StyledStack>
    </TableCell>
  );
};

export default HeaderCell;

/**
import React, { useState } from "react";
import { TableCell, Typography, Stack, styled } from "@mui/material";
import { Disciplina } from "@/context/Global/utils";
interface HeaderCellProps {
  disciplina: Disciplina;
  onHeaderClick: (event: React.MouseEvent, disciplina: Disciplina) => void;
  setHeaderCollor: (id_disciplina: string) => string;
}

// StyledTableCell com estilos dinâmicos baseado no hover
const StyledTableCell = styled(TableCell)<{ hoveredCellId: string | null; id: string }>(({ theme, hoveredCellId, id }) => ({
  transition: theme.transitions.create(['transform', 'width', 'height'], {
    duration: theme.transitions.duration.standard,
  }),
  position: 'relative',
  zIndex: 1,
  overflow: 'hidden', // Inicialmente corta o texto
  textOverflow: 'ellipsis', // Aplica o ellipsis no texto longo
  whiteSpace: 'nowrap', // Força o texto a ficar em uma linha
  minWidth: '12rem', // Define o tamanho inicial
  maxWidth: '12rem', // Define o tamanho inicial
  "&:hover": {
    transform: "scale3d(1.1, 1.1, 1)", // Aplica o efeito de escala
    zIndex: 10, // Traz o componente à frente dos outros
    overflow: 'visible', // Permite que o conteúdo seja exibido
    whiteSpace: 'normal', // Permite o texto quebrar em várias linhas
    minWidth: '22rem', // Expande a largura mínima no hover
    maxWidth: '22rem', // Expande a largura máxima no hover
    transition: theme.transitions.duration.standard,
    paddingTop: hoveredCellId === id ? '4px' : '0px', // Adiciona padding-top quando hover
  },
}));

const HeaderCell: React.FC<HeaderCellProps> = ({
  disciplina,
  onHeaderClick,
  setHeaderCollor,
}) => {

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

  // Estado para armazenar qual célula está sendo hover
  const [hoveredCellId, setHoveredCellId] = useState<string | null>(null);

  // Funções de hover
  const handleMouseEnter = (id: string) => {
    setHoveredCellId(id);
  };

  const handleMouseLeave = () => {
    setHoveredCellId(null);
  };


  // Estilos dinâmicos baseados no hover para Stack e Typography
  const getStackStyle = (id: string) => ({
    height: hoveredCellId === id ? "10rem" : "7rem", // Expande apenas o item em hover
    backgroundColor: setHeaderCollor(id),
    transition: "height 0.3s ease", // Transição suave de altura
  });

  const getTypographyStyle = (id: string) => ({
    whiteSpace: hoveredCellId === id ? 'normal' : 'nowrap', // Quebra a linha apenas no hover
    overflow: hoveredCellId === id ? 'visible' : 'hidden', // Mostra o texto completo no hover
    textOverflow: hoveredCellId === id ? 'unset' : 'ellipsis', // Remove o ellipsis no hover
    fontSize: hoveredCellId === id ? '16px' : '12px', // Aumenta a fonte no hover
    transition: "all 0.3s ease", // Transição suave
    padding: '2px' // Adiciona padding-top quando hover
  });

  return (
    <StyledTableCell
      key={disciplina.id}
      id={disciplina.id}
      hoveredCellId={hoveredCellId}
      onClick={(event) => onHeaderClick(event, disciplina)}
      onMouseEnter={() => handleMouseEnter(disciplina.id)} // Ativa o hover
      onMouseLeave={handleMouseLeave} // Desativa o hover
      style={{
        backgroundColor: 'white',
        margin: 0,
        padding: 0,
      }}
    >
      <Stack
        spacing={1}
        className="stack-style"
        sx={getStackStyle(disciplina.id)} // Aplica os estilos dinâmicos ao Stack
      >
        <Typography
          align="left"
          variant="body1"
          style={{ fontWeight: "bold", ...getTypographyStyle(disciplina.id) }} // Aplica estilos dinâmicos
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
          style={{ fontWeight: "bold", fontSize: "13px", ...getTypographyStyle(disciplina.id) }} // Estilos dinâmicos
        >
          {disciplina.codigo + " " + disciplina.nome}
        </Typography>
        {createHorariosblock(disciplina)}
      </Stack>
    </StyledTableCell>
  );
};

export default HeaderCell;
 
 */
