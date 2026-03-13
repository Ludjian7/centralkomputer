import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import tema kustom
import theme from './theme';

// Layout components
import Layout from './components/Layout/Layout';

// Auth pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Dashboard pages
import Dashboard from './pages/Dashboard/Dashboard';

// Product pages
import ProductList from './pages/Products/ProductList';
import ProductDetail from './pages/Products/ProductDetail';
import ProductForm from './pages/Products/ProductForm';

// Supplier pages
import SupplierList from './pages/Suppliers/SupplierList';
import SupplierDetail from './pages/Suppliers/SupplierDetail';
import SupplierForm from './pages/Suppliers/SupplierForm';

// Sales pages
import SalesList from './pages/Sales/SalesList';
import SaleDetail from './pages/Sales/SaleDetail';
import SaleForm from './pages/Sales/SaleForm';

// Report pages
import { ReportsHome, SalesReport, InventoryReport } from './pages/Reports';
import SupplierReport from './pages/Reports/SupplierReport';
import TransactionsReport from './pages/Reports/TransactionsReport';

// Employee pages
import EmployeeList from './pages/Employees/EmployeeList';
import EmployeeDetail from './pages/Employees/EmployeeDetail';
import EmployeeForm from './pages/Employees/EmployeeForm';

// Context
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            
            {/* Product routes */}
            <Route path="products">
              <Route index element={<ProductList />} />
              <Route path="new" element={<ProductForm />} />
              <Route path=":id" element={<ProductDetail />} />
              <Route path=":id/edit" element={<ProductForm />} />
            </Route>
            
            {/* Supplier routes */}
            <Route path="suppliers">
              <Route index element={<SupplierList />} />
              <Route path="new" element={<SupplierForm />} />
              <Route path=":id" element={<SupplierDetail />} />
              <Route path=":id/edit" element={<SupplierForm />} />
            </Route>
            
            {/* Sales routes */}
            <Route path="sales">
              <Route index element={<SalesList />} />
              <Route path="new" element={<SaleForm />} />
              <Route path=":id" element={<SaleDetail />} />
              <Route path=":id/edit" element={<SaleForm />} />
            </Route>
            
            {/* Reports routes */}
            <Route path="reports">
              <Route index element={<ReportsHome />} />
              <Route path="sales" element={<SalesReport />} />
              <Route path="inventory" element={<InventoryReport />} />
              <Route path="transactions" element={<TransactionsReport />} />
              <Route path="suppliers" element={<SupplierReport />} />
              <Route path="stores" element={<ReportsHome />} />
            </Route>
            
            {/* Employee routes */}
            <Route path="employees">
              <Route index element={<EmployeeList />} />
              <Route path="new" element={<EmployeeForm />} />
              <Route path=":id" element={<EmployeeDetail />} />
              <Route path=":id/edit" element={<EmployeeForm />} />
            </Route>

            {/* Add more routes for other modules */}
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 