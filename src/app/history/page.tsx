"use client"

import { useGlobalContext } from "@/context/Global"
import { Container, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody} from "@mui/material"
import SolutionHistoryRow from "./components/solutionHistoryRow";


const tableColumns = ['Identificador', 'Avaliação', 'Inserção', /*'Algoritmo',*/ 'Ações'];

export default function History() {
    const {solucaoAtual, setSolucaoAtual, historicoSolucoes, setHistoricoSolucoes} = useGlobalContext()

    const createHistoryColumns = () => {
        const historyColumns = [];

        for(const column of tableColumns) { 
            historyColumns.push(<TableCell align="center" key={`cell_row_${column}`} ><Typography key={`typigraphy_${column}`} variant="h6" color="textPrimary" align="center">{column}</Typography></TableCell>)
        }

        return historyColumns;
    }

    const createHistoryComponents = () => {
        const historyComponents = [];

        historicoSolucoes.forEach((value, key) => {
            historyComponents.push(<SolutionHistoryRow key={`component_${key}`} id={key} solucao={value}/>)
        })

        return historyComponents;
    }

    return (
        <Container maxWidth="lg" key="container">
            <TableContainer key='tabbleContainer'>
                <Table key="table">
                    <TableHead key="tableHead">
                        <TableRow key="tableHeadRow">
                            <TableCell key="emptyCellRow"/>
                            {createHistoryColumns()}
                        </TableRow>
                    </TableHead>
                    <TableBody key="tableBody">
                        {createHistoryComponents()}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    )
}