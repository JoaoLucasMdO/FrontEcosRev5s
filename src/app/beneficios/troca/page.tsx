'use client'

import { useEffect, useState } from "react";
import { 
  Container, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Checkbox, 
  Typography, 
  Box,
  TablePagination,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert
} from "@mui/material";
import Layout from "@/components/UI/organisms/Layout";
import { benefitsService } from "../../../../routes/benefitRoute";
import { userService } from "../../../../routes/userRoute";
import ButtonAtom from "@/components/UI/atoms/ButtonAtom";

interface SelectableTableProps {
  rows: IRow[];
  onRowSelect: (selectedRows: IRow[]) => void;
  sx?: object
}

const SelectableTable: React.FC<SelectableTableProps> = ({ rows, onRowSelect }) => {
  const [selectedRows, setSelectedRows] = useState<IRow[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleRowClick = (row: IRow) => {
    const isSelected = selectedRows.includes(row);
    const newSelectedRows = isSelected
      ? selectedRows.filter((r) => r._id !== row._id)
      : [...selectedRows, row];
    setSelectedRows(newSelectedRows);
    onRowSelect(newSelectedRows);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const displayedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 500, overflowX: 'auto' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox"></TableCell>
            <TableCell>Nome</TableCell>
            <TableCell>Data</TableCell>
            {!isMobile && <TableCell>Endereço</TableCell>}
            <TableCell>Pontos</TableCell>
            <TableCell>Quantidade</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayedRows.map((row) => (
            <TableRow key={row._id} onClick={() => handleRowClick(row)} hover>
              <TableCell padding="checkbox">
                <Checkbox checked={selectedRows.includes(row)} />
              </TableCell>
              <TableCell>{row.nome}</TableCell>
              <TableCell>{row.data}</TableCell>
              {!isMobile && <TableCell>{row.endereco}</TableCell>}
              <TableCell>{row.pontos}</TableCell>
              <TableCell>{row.quantidade}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
      />
    </TableContainer>
  );
};

const Beneficios = () => {
  const [rows, setRows] = useState<IRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<IRow[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [Points, setPoints] = useState(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchLoggedUser = async () => {
      const response = await userService.getLoggedUser();
      setPoints(Number(response[0].pontos))
    };

    const fetchBeneficios = async () => {
      const response = await benefitsService.getAllBenefits();
      const beneficios = response.map((beneficio: any) => ({
        _id: beneficio._id,
        data: beneficio.data,
        nome: beneficio.nome,
        endereco: beneficio.endereco,
        pontos: beneficio.pontos,
        quantidade: beneficio.quantidade,
      }));
      setRows(beneficios);
    };

    fetchBeneficios();
    fetchLoggedUser();
  }, []);

  const handleRowSelect = (selected: IRow[]) => {
    setSelectedRows(selected);
    setTotalPoints(selected.reduce((sum, row) => sum + Number(row.pontos), 0));
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleExchange = async () => {
    if (selectedRows.length === 0) {
      setSnackbar({
        open: true,
        message: 'Não há benefício selecionado. Por favor, selecione um ou mais benefícios.',
        severity: 'warning'
      });
      return;
    }

    if (totalPoints > Points) {
      setSnackbar({
        open: true,
        message: 'Você não tem pontos suficientes para realizar a troca.',
        severity: 'error'
      });
      return;
    }

    try {
      const updatedPoints = Points - totalPoints;
      await userService.updateUserPoints({ pontos: updatedPoints.toString() });
      setPoints(updatedPoints);

      for (const selected of selectedRows) {
        if (selected.quantidade > 0) {
          const updatedBenefit = {
            ...selected,
            quantidade: selected.quantidade - 1,
          };

          await benefitsService.updateBenefit(updatedBenefit);

          setRows((prevRows) =>
            prevRows.map((row) =>
              row._id === updatedBenefit._id ? { ...row, quantidade: updatedBenefit.quantidade } : row
            )
          );
        } else {
          setSnackbar({
            open: true,
            message: `O benefício ${selected.nome} está sem estoque.`,
            severity: 'error'
          });
        }
      }

      setSnackbar({
        open: true,
        message: 'Sua troca de pontos foi concluída com sucesso! Verifique em seu e-mail os detalhes de seu benefício. Agradecemos sua participação.',
        severity: 'success'
      });

      setTotalPoints(0);
      setSelectedRows([]);
    } catch (error) {
      console.error("Erro ao realizar troca:", error);
      setSnackbar({
        open: true,
        message: 'Erro ao realizar a troca. Tente novamente.',
        severity: 'error',
        
        
      });
    }
  };

  return (
    <Layout>
      <Container 
        sx={{ 
          paddingTop: { xs: 1, sm: 2, md: 3 }, 
          paddingBottom: { xs: 1, sm: 2, md: 3 },
          display: 'flex', 
          flexDirection: 'column', 
          gap: { xs: 1, sm: 2, md: 2 },
          minHeight: 'auto',
          justifyContent: 'space-between',
          width: '100%', 
          maxWidth: '100%', 
          overflowX: 'hidden' 
        }}
      >
        <SelectableTable 
          rows={rows} 
          onRowSelect={handleRowSelect} 
          sx={{
            marginBottom: { xs: 1, sm: 0 }, 
          }}
        />
        
        <Box 
          sx={{ 
            marginTop: { xs: 2, sm: 2, md: 2, lg: 3 },  // Adiciona um espaço extra no topo para TV
            width: '100%',
            maxWidth: { xs: '100%', sm: 400, md: 400, lg: 500, xl: 500 },
            bgcolor: 'background.paper',
            boxShadow: 3,
            py: { xs: 2, sm: 3, md: 3 },
            px: { xs: 2, sm: 3, md: 3 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            mx: 'auto',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="body1">
              {`Pontos Totais: ${totalPoints}`}
            </Typography>
            <Typography 
              variant="body1" 
              color={totalPoints > Points ? "error" : "inherit"}
              sx={{ mb: 2 }}
            >
              {`Seus pontos: ${Points}`}
            </Typography>
          </Box>
          
          <ButtonAtom
            variant="contained"
            disabled={selectedRows.length === 0 || totalPoints > Points}
            onClick={handleExchange}
          >
            Trocar
          </ButtonAtom>
        </Box>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}

        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
};

export default Beneficios;
