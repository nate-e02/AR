import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MenuPage from './pages/MenuPage'
import KitchenPage from './pages/KitchenPage'
import BarPage from './pages/BarPage'
import WaiterPage from './pages/WaiterPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/table/:tableId" element={<MenuPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />
        <Route path="/bar" element={<BarPage />} />
        <Route path="/waiter" element={<WaiterPage />} />
        <Route path="/" element={<Navigate to="/table/1" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
