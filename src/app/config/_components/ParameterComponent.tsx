import { useState } from "react";
import { Paper, TextField, IconButton, Switch, Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export interface ParameterComponentProps {
  name: string;
  value?: number;
  description?: string;
  isActive: boolean;
  setValue: (newValue: number) => void;
  setIsActive?: (newState: boolean) => void;
  showInformations: (
    message: string,
    type: "success" | "info" | "warning" | "error",
    closeTime?: number
  ) => void;
}

export default function ParameterComponent({
  name,
  value,
  description,
  isActive,
  setValue,
  setIsActive,
  showInformations,
}: ParameterComponentProps) {
  const [inputValue, setInputValue] = useState<string>(value?.toString() || "");

  // const [erro, setErro] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    const parsedValue = parseFloat(newValue);
    if (!isNaN(parsedValue)) {
      setValue(parsedValue);
      // if (erro === true) {
      //   setErro(false);
      // }
    }
    // } else {
    //   if (erro === false) {
    //     setErro(true);
    //   }
    // }
  };

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
      <TextField
        type="number"
        value={inputValue}
        onChange={handleInputChange}
        variant="outlined"
        size="small"
        sx={{ width: 80 }}
        disabled={!isActive}
        // error={erro}
        // helperText={erro ? "Digite apenas números." : ""}
      />
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
