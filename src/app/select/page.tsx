"use client"

import * as React from 'react';
import Grid from '@mui/material/Grid2';
import List from '@mui/material/List';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Disciplina, Docente, useGlobalContext } from '@/context/Global';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';


function not<T>(a: readonly T[], b: readonly T[]) {
  return a.filter((value) => b.indexOf(value) === -1);
}

function intersection<T>(a: readonly T[], b: readonly T[]) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

function union<T>(a: readonly T[], b: readonly T[]) {
  return [...a, ...not(b, a)];
}

export default function Seletor() {
  const { docentes, setDocentes, disciplinas, setDisciplinas } = useGlobalContext(); // Pega docentes e disciplinas do contexto global
  const [checked, setChecked] = React.useState<readonly (Docente | Disciplina)[]>([]);
  const [selectedEntity, setSelectedEntity] = React.useState<'docente' | 'disciplina'>('docente'); // Estado para selecionar a entidade atual

  const handleToggleEntity = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked([]); // Limpa os itens selecionados ao mudar a entidade
    setSelectedEntity((event.target as HTMLInputElement).value as 'docente' | 'disciplina');
  };

  // Filtra docentes ou disciplinas com base na seleção do botão de rádio
  const left = selectedEntity === 'docente'
    ? docentes.filter((docente) => docente.ativo)
    : disciplinas.filter((disciplina) => disciplina.ativo);

  const right = selectedEntity === 'docente'
    ? docentes.filter((docente) => !docente.ativo)
    : disciplinas.filter((disciplina) => !disciplina.ativo);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  const handleToggle = (value: Docente | Disciplina) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const numberOfChecked = (items: readonly (Docente | Disciplina)[]) =>
    intersection(checked, items).length;

  const handleToggleAll = (items: readonly (Docente | Disciplina)[]) => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items));
    } else {
      setChecked(union(checked, items));
    }
  };

  const updateAtivos = (updatedLeft: (Docente | Disciplina)[], updatedRight: (Docente | Disciplina)[]) => {
    if (selectedEntity === 'docente') {
      // Atualiza os docentes
      const updatedDocentes = docentes.map((docente) => ({
        ...docente,
        ativo: updatedLeft.includes(docente),
      }));
      setDocentes(updatedDocentes);
    } else {
      // Atualiza as disciplinas
      const updatedDisciplinas = disciplinas.map((disciplina) => ({
        ...disciplina,
        ativo: updatedLeft.includes(disciplina),
      }));
      setDisciplinas(updatedDisciplinas);
    }
  };

  const handleCheckedRight = () => {
    const updatedLeft = not(left, leftChecked);
    const updatedRight = right.concat(leftChecked);
    updateAtivos(updatedLeft, updatedRight);
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    const updatedLeft = left.concat(rightChecked);
    const updatedRight = not(right, rightChecked);
    updateAtivos(updatedLeft, updatedRight);
    setChecked(not(checked, rightChecked));
  };

  const customList = (title: React.ReactNode, items: readonly (Disciplina| Docente )[]) => (
    <Card>
      <CardHeader
        sx={{ px: 2, py: 1 }}
        avatar={
          <Checkbox
            onClick={handleToggleAll(items)}
            checked={numberOfChecked(items) === items.length && items.length !== 0}
            indeterminate={
              numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0
            }
            disabled={items.length === 0}
            inputProps={{
              'aria-label': 'all items selected',
            }}
          />
        }
        title={title}
        subheader={`${numberOfChecked(items)}/${items.length} selecionados`}
      />
      <Divider />
      <List
        sx={{
          width: 400,
          height: 500,
          bgcolor: 'background.paper',
          overflow: 'auto',
        }}
        dense
        component="div"
        role="list"
      >
        {items.map((value: Disciplina|Docente) => {
          const labelId = `transfer-list-all-item-${selectedEntity == 'disciplina' ? value.id : value.nome}-label`;

          return (
            <ListItemButton
              key={selectedEntity == 'disciplina' ? value.id : value.nome}
              role="listitem"
              onClick={handleToggle(value)}
            >
              <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{
                    'aria-labelledby': labelId,
                  }}
                />
              </ListItemIcon>
              <ListItemText
                id={labelId}
                primary={selectedEntity == 'disciplina' ? `${value.id} - ${value.nome}` : value.nome }
              />
            </ListItemButton>
          );
        })}
      </List>
    </Card>
  );

  return (
    <div>
      <RadioGroup
        row
        value={selectedEntity}
        onChange={handleToggleEntity}
        sx={{ mb: 2, display: 'flex', justifyContent: 'center'}}
      >
        <FormControlLabel
          value="docente"
          control={<Radio />}
          label="Docentes"
        />
        <FormControlLabel
          value="disciplina"
          control={<Radio />}
          label="Disciplinas"
        />
      </RadioGroup>
      <Grid
        container
        spacing={2}
        sx={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <Grid>{customList('Ativos', left)}</Grid>
        <Grid>
          <Grid container direction="column" sx={{ alignItems: 'center' }}>
            <Button
              sx={{ my: 0.5 }}
              variant="contained"
              size="small"
              onClick={handleCheckedRight}
              disabled={leftChecked.length === 0}
              aria-label="move selected right"
            >
              <ChevronRightIcon />
            </Button>
            <Button
              sx={{ my: 0.5 }}
              variant="contained"
              size="small"
              onClick={handleCheckedLeft}
              disabled={rightChecked.length === 0}
              aria-label="move selected left"
            >
              <ChevronLeftIcon />
            </Button>
          </Grid>
        </Grid>
        <Grid>{customList('Inativos', right)}</Grid>
      </Grid>
    </div>
  );
}
