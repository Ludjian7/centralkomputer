import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StyledDetailCard, themeColors } from '../../components/Layout/LayoutStyles';

// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InventoryIcon from '@mui/icons-material/Inventory';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [activeTab]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = '/api/products';
      
      // Add type filter if not showing all
      if (activeTab !== 'all') {
        url += `?type=${activeTab}`;
      }
      
      const response = await axios.get(url);
      if (response.data.success) {
        setProducts(response.data.data);
      } else {
        console.error('Failed to fetch products:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await axios.delete(`/api/products/${id}`);
        if (response.data.success) {
          setProducts(products.filter(product => product.id !== id));
        } else {
          console.error('Failed to delete product:', response.data.message);
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Paginate products
  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading && products.length === 0) {
    return <Typography>Loading products...</Typography>;
  }

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Produk</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/products/new')}
          sx={{ bgcolor: themeColors.secondary }}
        >
          Tambah Produk
        </Button>
      </Box>

      <StyledDetailCard color={themeColors.info}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab 
              icon={<InventoryIcon />} 
              iconPosition="start" 
              label="All Products" 
              value="all" 
              sx={{ 
                backgroundColor: activeTab === 'all' ? `${themeColors.lightGreen}80` : 'white',
                margin: '0 4px',
                borderRadius: '8px 8px 0 0',
                fontWeight: activeTab === 'all' ? 'bold' : 'normal',
                transition: 'all 0.2s ease-in-out'
              }}
            />
            <Tab 
              icon={<InventoryIcon />} 
              iconPosition="start" 
              label="Barang" 
              value="physical" 
              sx={{ 
                backgroundColor: activeTab === 'physical' ? `${themeColors.info}80` : 'white',
                margin: '0 4px',
                borderRadius: '8px 8px 0 0',
                fontWeight: activeTab === 'physical' ? 'bold' : 'normal',
                transition: 'all 0.2s ease-in-out'
              }}
            />
            <Tab 
              icon={<MiscellaneousServicesIcon />} 
              iconPosition="start" 
              label="Services" 
              value="service" 
              sx={{ 
                backgroundColor: activeTab === 'service' ? `${themeColors.deepOrange}80` : 'white',
                margin: '0 4px',
                borderRadius: '8px 8px 0 0',
                fontWeight: activeTab === 'service' ? 'bold' : 'normal',
                transition: 'all 0.2s ease-in-out'
              }}
            />
          </Tabs>
        </Box>
        
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Cari berdasarkan nama, SKU, kategori, atau merek"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size="small"
          />
        </Box>

        <Box sx={{ overflowX: 'auto', width: '100%' }}>
          <TableContainer>
            <Table sx={{ minWidth: { xs: 350, sm: 650 } }} aria-label="products table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nama</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Tipe</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>SKU</TableCell>
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Kategori</TableCell>
                  <TableCell align="right">Harga</TableCell>
                  {activeTab !== 'service' && (
                    <TableCell align="right" sx={{ display: { xs: 'none', md: 'table-cell' } }}>Stok</TableCell>
                  )}
                  {activeTab === 'service' && (
                    <TableCell align="right" sx={{ display: { xs: 'none', md: 'table-cell' } }}>Durasi</TableCell>
                  )}
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Status</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell component="th" scope="row" sx={{ maxWidth: { xs: '120px', sm: '200px' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.name}
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        {product.type === 'service' ? (
                          <Chip size="small" label="Jasa" color="secondary" />
                        ) : (
                          <Chip size="small" label="Barang" color="primary" />
                        )}
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{product.sku}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{product.category || '-'}</TableCell>
                      <TableCell align="right">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0
                        }).format(product.price)}
                      </TableCell>
                      {product.type !== 'service' ? (
                        <TableCell align="right" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                          {product.quantity < product.minQuantity ? (
                            <Chip 
                              size="small" 
                              label={product.quantity.toString()} 
                              color="error" 
                            />
                          ) : (
                            product.quantity
                          )}
                        </TableCell>
                      ) : (
                        <TableCell align="right" sx={{ display: { xs: 'none', md: 'table-cell' } }}>{product.duration || '-'} menit</TableCell>
                      )}
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        {product.isActive ? (
                          <Chip size="small" label="Aktif" color="success" />
                        ) : (
                          <Chip size="small" label="Nonaktif" color="default" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          size="small" 
                          onClick={() => navigate(`/products/${product.id}`)}
                          title="Lihat Detail"
                          sx={{ color: themeColors.info }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => navigate(`/products/${product.id}/edit`)}
                          title="Edit Produk"
                          sx={{ color: themeColors.warning }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(product.id)}
                          title="Hapus Produk"
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      {searchTerm ? 'Tidak ada produk yang sesuai dengan pencarian' : 'Belum ada produk tersedia'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Baris:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`}
        />
      </StyledDetailCard>
    </Box>
  );
};

export default ProductList; 