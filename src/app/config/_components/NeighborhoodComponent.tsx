import { Paper, IconButton, Switch, Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export interface NeighborhoodComponentProps {
  name: string;
  description?: string;
  isActive: boolean;
  setIsActive?: (newState: boolean) => void;
  showInformations: (
    message: string,
    type: "success" | "info" | "warning" | "error",
    closeTime?: number
  ) => void;
}

export default function NeighborhoodComponent({
  name,
  description,
  isActive,
  setIsActive,
  showInformations,
}: NeighborhoodComponentProps) {
  // const [erro, setErro] = useState(false);

  return (
    <Paper
      elevation={2}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 2,
        backgroundColor: isActive ? "background.paper" : "gray",
        width: "100%",
      }}
    >
      <span>{name}</span>
      <Tooltip title="Informações">
        <IconButton
          color="info"
          onClick={() => showInformations(description, "info", 10)}
          disabled={description.length === 0}
        >
          <InfoOutlinedIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
      <Switch checked={isActive} onChange={() => setIsActive(!isActive)} />
    </Paper>
  );
}
