import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { CustomerDashboard } from './pages/customer/Dashboard'
import { SubmitInquiry } from './pages/customer/SubmitInquiry'
import { InquiriesList } from './pages/customer/InquiriesList'
import { SalespersonLayout } from './layouts/SalespersonLayout'
import { SalespersonDashboard } from './pages/salesperson/Dashboard'
import { LeadManagement } from './pages/salesperson/LeadManagement'
import { InventoryList } from './pages/salesperson/InventoryList'
import { AddInventory } from './pages/salesperson/AddInventory'
import { InventoryDetails } from './pages/salesperson/InventoryDetails'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Customer Protected Routes */}
          <Route 
            path="/customer" 
            element={
              <ProtectedRoute allowedRole="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customer/submit" 
            element={
              <ProtectedRoute allowedRole="customer">
                <SubmitInquiry />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customer/inquiries" 
            element={
              <ProtectedRoute allowedRole="customer">
                <InquiriesList />
              </ProtectedRoute>
            } 
          />

          {/* Salesperson Protected Routes */}
          <Route 
            path="/salesperson" 
            element={
              <ProtectedRoute allowedRole="salesperson">
                <SalespersonLayout>
                  <SalespersonDashboard />
                </SalespersonLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/salesperson/leads" 
            element={
              <ProtectedRoute allowedRole="salesperson">
                <SalespersonLayout>
                  <LeadManagement />
                </SalespersonLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/salesperson/inventory" 
            element={
              <ProtectedRoute allowedRole="salesperson">
                <SalespersonLayout>
                  <InventoryList />
                </SalespersonLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/salesperson/inventory/add" 
            element={
              <ProtectedRoute allowedRole="salesperson">
                <SalespersonLayout>
                  <AddInventory />
                </SalespersonLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/salesperson/inventory/:id" 
            element={
              <ProtectedRoute allowedRole="salesperson">
                <SalespersonLayout>
                  <InventoryDetails />
                </SalespersonLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/salesperson/inventory/:id/edit" 
            element={
              <ProtectedRoute allowedRole="salesperson">
                <SalespersonLayout>
                  <AddInventory />
                </SalespersonLayout>
              </ProtectedRoute>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
