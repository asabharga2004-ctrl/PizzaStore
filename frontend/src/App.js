import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import store from './store';
import Navbar       from './components/Navbar';
import Login        from './pages/Login';
import Register     from './pages/Register';
import MenuPage     from './pages/MenuPage';
import CartPage     from './pages/CartPage';
import OrdersPage   from './pages/OrdersPage';
import MessagesPage from './pages/MessagesPage';
import AdminMenu    from './pages/AdminMenu';
import AdminOrders  from './pages/AdminOrders';
import AdminRevenue from './pages/AdminRevenue';
import { fetchCart }     from './store/slices/cartSlice';
import { fetchMessages } from './store/slices/messageSlice';

function PrivateRoute({ children }) {
  const { user } = useSelector(s => s.auth);
  return user ? children : <Navigate to="/login" />;
}
function AdminRoute({ children }) {
  const { user } = useSelector(s => s.auth);
  return user && user.role === 'admin' ? children : <Navigate to="/login" />;
}

function HomeRoute() {
  const { user } = useSelector(s => s.auth);
  if (!user) return <Navigate to="/login" />;
  return user.role === 'admin' ? <Navigate to="/admin/orders" /> : <MenuPage />;
}

function AppInner() {
  const dispatch      = useDispatch();
  const { user, token } = useSelector(s => s.auth);

  useEffect(() => {
    if (token && user?.role === 'customer') {
      dispatch(fetchCart(token));
      dispatch(fetchMessages(token));
    }
  }, [token, user]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login"          element={<Login />} />
        <Route path="/register"       element={<Register />} />
        <Route path="/"               element={<HomeRoute />} />
        <Route path="/cart"           element={<PrivateRoute><CartPage /></PrivateRoute>} />
        <Route path="/orders"         element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
        <Route path="/messages"       element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
        <Route path="/admin/menu"     element={<AdminRoute><AdminMenu /></AdminRoute>} />
        <Route path="/admin/orders"   element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/revenue"  element={<AdminRoute><AdminRevenue /></AdminRoute>} />
        <Route path="*"               element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </Provider>
  );
}
