import { ButtonGroup, IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import { useSolutionHistory } from "@/context/SolutionHistory/hooks";

interface SolutionHistoryButtonGroupProps {
  id: string;
  remove: (id: string) => void;
  restore: (id: string) => void
}

const SolutionHistoryButtonGroup: React.FC<SolutionHistoryButtonGroupProps> = ({
  id, remove, restore
}) => {
  const {solucaoAtual} = useSolutionHistory()

  return (
    <ButtonGroup key={`buttonGroup_${id}`}>
      <Tooltip
        title="Remover"
        slotProps={{
          popper: {
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, -5],
                },
              },
            ],
          },
        }}
        arrow
      >
        <span>
          <IconButton key={`deleteButton_${id}`} color="error" onClick={() => remove(id)} disabled={solucaoAtual.idHistorico === id}>
            <DeleteIcon key={`deleteIcon_${id}`} />
          </IconButton>
        </span>
      </Tooltip>
      
      <Tooltip
        title="Restaurar"
        slotProps={{
          popper: {
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, -5],
                },
              },
            ],
          },
        }}
        arrow
      >
        <span> {/** Pela documentação do Material UI deve ser feito dessa forma quando existe a possibilidade do botão ser desativado*/}
          <IconButton key={`restoreButton_${id}`} color="primary" onClick={() => restore(id)} disabled={solucaoAtual.idHistorico === id}>
            <RestoreIcon key={`restoreIcon_${id}`} />
          </IconButton>
        </span>
      </Tooltip>
    </ButtonGroup>
  );
};

export default SolutionHistoryButtonGroup;
