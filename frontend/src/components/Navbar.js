import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';

export default function Navbar() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useSelector(s => s.auth);
  const { items } = useSelector(s => s.cart);
  const { messages } = useSelector(s => s.messages);
  const isAdmin   = user?.role === 'admin';
  const cartCount = items?.length || 0;
  const msgCount  = messages?.filter(m => !m.isRead).length || 0;

  function handleLogout() { dispatch(logout()); navigate('/login'); }

  const isActive = p => location.pathname === p;
  const lk = (to, label, badge=0) => (
    <Link to={to} style={{ color:isActive(to)?'#e63312':'#ccc', fontWeight:isActive(to)?'600':'400', fontSize:'13px', padding:'6px 12px', borderRadius:'4px', background:isActive(to)?'rgba(230,51,18,0.1)':'transparent', letterSpacing:'0.5px', position:'relative', display:'inline-flex', alignItems:'center', gap:'4px' }}>
      {label}
      {badge>0 && <span style={{ background:'#e63312', color:'#fff', borderRadius:'50%', width:'16px', height:'16px', fontSize:'9px', display:'inline-flex', alignItems:'center', justifyContent:'center', fontWeight:'700', marginLeft:'2px' }}>{badge}</span>}
    </Link>
  );

  return (
    <>
      <div style={{ background:'#e63312', padding:'5px 0', textAlign:'center', fontSize:'11px', fontWeight:'500', letterSpacing:'1px', color:'#fff' }}>
        🍕 FREE DELIVERY ABOVE ₹299 &nbsp;|&nbsp; CODE: PIZZA30 FOR 30% OFF
      </div>
      <nav style={{ background:'#1a1a1a', borderBottom:'2px solid #e63312', padding:'0 24px', position:'sticky', top:0, zIndex:1000, boxShadow:'0 4px 20px rgba(0,0,0,0.5)' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:'64px' }}>
          <Link to={user?(isAdmin?'/admin/orders':'/'):'/'} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ background:'#e63312', borderRadius:'50%', width:'40px', height:'40px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>🍕</div>
            <div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'22px', color:'#fff', letterSpacing:'2px', lineHeight:1 }}>PIZZA STORE</div>
              <div style={{ fontSize:'9px', color:'#e63312', letterSpacing:'3px' }}>HOT & FRESH</div>
            </div>
          </Link>

          <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
            {user && !isAdmin && (
              <>
                {lk('/','MENU')}
                {lk('/cart','🛒 CART', cartCount)}
                {lk('/orders','MY ORDERS')}
                {lk('/messages','📩 ALERTS', msgCount)}
              </>
            )}
            {isAdmin && (
              <>
                {lk('/admin/menu','MENU CRUD')}
                {lk('/admin/orders','ORDERS')}
                {lk('/admin/revenue','REVENUE')}
              </>
            )}
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            {user ? (
              <>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'11px', color:'#666' }}>{isAdmin?'Admin':'Customer'}</div>
                  <div style={{ fontSize:'13px', fontWeight:'600', color:'#fff' }}>{user.name}</div>
                </div>
                <button onClick={handleLogout} style={{ background:'transparent', border:'1px solid #e63312', color:'#e63312', padding:'7px 16px', borderRadius:'4px', fontSize:'12px', fontWeight:'600', letterSpacing:'0.5px', cursor:'pointer' }}>LOGOUT</button>
              </>
            ) : (
              <>
                <Link to="/login" style={{ color:'#aaa', fontSize:'13px' }}>LOGIN</Link>
                <Link to="/register" style={{ background:'#e63312', color:'#fff', padding:'8px 18px', borderRadius:'4px', fontSize:'13px', fontWeight:'600' }}>ORDER NOW</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
