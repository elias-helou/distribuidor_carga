import React, { useState } from "react";
import {
  Card,
  CardHeader,
  Checkbox,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  Box,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Disciplina, Docente, isDisciplina } from "@/context/Global/utils";

interface CustomSelectorInterface {
  title: React.ReactNode;
  items: readonly (Disciplina | Docente)[];
  handleToggle: (value: Disciplina | Docente) => void;
  handleToggleAll: (items: readonly (Disciplina | Docente)[]) => () => void;
  numberOfChecked: (items: readonly (Disciplina | Docente)[]) => number;
  checked: readonly (Disciplina | Docente)[];
}

export default function CustomSelector({
  title,
  items,
  handleToggle,
  handleToggleAll,
  numberOfChecked,
  checked,
}: CustomSelectorInterface) {
  const [filter, setFilter] = useState("");

  const filteredItems = items.filter((item) =>
    (isDisciplina(item) ? item.nome : item.nome)
      .toLowerCase()
      .includes(filter.toLowerCase())
  );

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
      <CardHeader
        sx={{ px: 2, py: 1 }}
        avatar={
          <Checkbox
            onClick={handleToggleAll(items)}
            checked={
              numberOfChecked(items) === items.length && items.length !== 0
            }
            indeterminate={
              numberOfChecked(items) !== items.length &&
              numberOfChecked(items) !== 0
            }
            disabled={items.length === 0}
            inputProps={{
              "aria-label": "all items selected",
            }}
          />
        }
        title={title}
        subheader={`${numberOfChecked(items)}/${items.length} selecionados`}
      />
      <Divider />
        {/* Campo de filtro` */}
      <Box sx={{ paddingX: 2, paddingY: 1 }}>
        <TextField
          variant="outlined"
          placeholder="Buscar..."
          fullWidth
          sx={{
            borderRadius: '4px',
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#f0f0f0',
              borderRadius: 2,
              '& fieldset': {
                borderColor: '#ddd',
              },
              '&:hover fieldset': {
                borderColor: '#bbb',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1976d2',
              },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
          onChange={(e) => setFilter(e.target.value)}
        />
      </Box>
      <List
        sx={{
          width: 400,
          height: 500,
          bgcolor: "background.paper",
          overflowY: "auto",
        }}
        dense
        component="div"
        role="list"
      >
        {filteredItems.map((value: Docente | Disciplina) => {
          const labelId = `transfer-list-all-item-${
            isDisciplina(value) ? value.id : value.nome
          }-label`;

          return (
            <ListItemButton
              key={isDisciplina(value) ? value.id : value.nome}
              role="listitem"
              onClick={() => handleToggle(value)}
            >
              <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{
                    "aria-labelledby": labelId,
                  }}
                />
              </ListItemIcon>
              <ListItemText
                id={labelId}
                primary={
                  isDisciplina(value)
                    ? `${value.id} - ${value.nome}`
                    : value.nome
                }
              />
            </ListItemButton>
          );
        })}
      </List>
    </Card>
  );
}
