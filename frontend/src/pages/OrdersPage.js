import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders, cancelOrder, clearOrderMsg } from '../store/slices/orderSlice';

const STATUS = {
  pending:   { color:'#f39c12', bg:'rgba(243,156,18,0.15)',  icon:'⏳', label:'PENDING' },
  accepted:  { color:'#27ae60', bg:'rgba(39,174,96,0.15)',   icon:'✅', label:'ACCEPTED' },
  rejected:  { color:'#e74c3c', bg:'rgba(231,76,60,0.15)',   icon:'❌', label:'REJECTED' },
  delivered: { color:'#3498db', bg:'rgba(52,152,219,0.15)',  icon:'🎉', label:'DELIVERED' },
  cancelled: { color:'#7f8c8d', bg:'rgba(127,140,141,0.15)', icon:'🚫', label:'CANCELLED' }
};

export default function OrdersPage() {
  const dispatch = useDispatch();
  const { orders, loading, successMsg } = useSelector(s => s.orders);
  const { token } = useSelector(s => s.auth);

  useEffect(() => { dispatch(fetchMyOrders(token)); }, []);
  useEffect(() => { if (successMsg) { const t = setTimeout(()=>dispatch(clearOrderMsg()),3000); return ()=>clearTimeout(t); } }, [successMsg]);

  function handleCancel(id) {
    if (window.confirm('Cancel this order?')) dispatch(cancelOrder({ id, token }));
  }

  return (
    <div style={{ background:'#0f0f0f', minHeight:'100vh', padding:'24px' }}>
      <div style={{ maxWidth:'800px', margin:'0 auto' }}>
        <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'36px', letterSpacing:'3px', marginBottom:'8px' }}>
          MY <span style={{ color:'#e63312' }}>ORDERS</span>
        </h1>
        <p style={{ color:'#666', fontSize:'14px', marginBottom:'24px' }}>Track your pizza orders in real-time</p>

        {successMsg && <div style={{ background:'rgba(39,174,96,0.15)', border:'1px solid rgba(39,174,96,0.4)', borderRadius:'8px', padding:'12px 16px', marginBottom:'16px', fontSize:'14px', color:'#27ae60' }}>✅ {successMsg}</div>}

        {loading ? (
          <div style={{ textAlign:'center', padding:'60px', color:'#555' }}><div style={{ fontSize:'36px' }}>⏳</div><p>Loading orders...</p></div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px', background:'#1a1a1a', borderRadius:'12px' }}>
            <div style={{ fontSize:'64px', marginBottom:'16px' }}>📦</div>
            <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'28px', letterSpacing:'2px', color:'#555' }}>NO ORDERS YET</h2>
          </div>
        ) : orders.map(o => {
          const st = STATUS[o.orderStatus]||STATUS.pending;
          return (
            <div key={o._id} style={{ background:'#1a1a1a', borderRadius:'12px', padding:'20px', marginBottom:'16px', border:'1px solid #252525', borderLeft:'4px solid '+st.color }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
                <div>
                  <div style={{ fontSize:'12px', color:'#666', letterSpacing:'1px', marginBottom:'3px' }}>ORDER #{o._id.slice(-8).toUpperCase()}</div>
                  <div style={{ fontSize:'12px', color:'#555' }}>{new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ background:st.bg, border:'1px solid '+st.color, color:st.color, padding:'4px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'700', letterSpacing:'1px' }}>
                  {st.icon} {st.label}
                </div>
              </div>
              <div style={{ marginBottom:'12px' }}>
                {o.items.map((item,i)=>(
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:'14px', color:'#bbb', marginBottom:'4px' }}>
                    <span>🍕 {item.name} × {item.quantity}</span>
                    <span style={{ color:'#fff' }}>₹{item.price*item.quantity}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'12px', borderTop:'1px solid #252525' }}>
                <div style={{ display:'flex', gap:'14px', fontSize:'12px', color:'#666' }}>
                  <span>🚚 {o.deliveryMode}</span>
                  <span>💳 {o.paymentMode||'cash'}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                  <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'22px', color:'#e63312' }}>₹{o.totalAmount}</span>
                  {o.orderStatus==='pending' && (
                    <button onClick={()=>handleCancel(o._id)} style={{ background:'rgba(231,76,60,0.15)', border:'1px solid rgba(231,76,60,0.4)', color:'#e74c3c', padding:'6px 14px', borderRadius:'6px', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>CANCEL</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
