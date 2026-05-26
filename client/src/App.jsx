import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import MenuPage from './pages/MenuPage'
import KitchenPage from './pages/KitchenPage'
import ProductsPage from './pages/ProductsPage'
import CategoriesPage from './pages/CategoriesPage'
import HistoryPage from './pages/HistoryPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <aside className="sidebar">
          <h2>🍽 POS</h2>
          <nav>
            <NavLink to="/" end>สั่งอาหาร</NavLink>
            <NavLink to="/kitchen">ห้องครัว</NavLink>
            <NavLink to="/products">สินค้า</NavLink>
            <NavLink to="/categories">หมวดหมู่</NavLink>
            <NavLink to="/history">ประวัติ</NavLink>
          </nav>
        </aside>
        <main className="main">
          <Routes>
            <Route path="/" element={<MenuPage />} />
            <Route path="/kitchen" element={<KitchenPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
