import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, updateOrderStatus, clearOrderMsg } from '../store/slices/orderSlice';

const STATUS = {
  pending:   { color:'#f39c12', bg:'rgba(243,156,18,0.15)',  icon:'⏳' },
  accepted:  { color:'#27ae60', bg:'rgba(39,174,96,0.15)',   icon:'✅' },
  rejected:  { color:'#e74c3c', bg:'rgba(231,76,60,0.15)',   icon:'❌' },
  delivered: { color:'#3498db', bg:'rgba(52,152,219,0.15)',  icon:'🎉' },
  cancelled: { color:'#7f8c8d', bg:'rgba(127,140,141,0.15)', icon:'🚫' }
};

export default function AdminOrders() {
  const dispatch = useDispatch();
  const { allOrders, loading, successMsg } = useSelector(s => s.orders);
  const { token } = useSelector(s => s.auth);
  const [msgTxt, setMsgTxt] = useState({});

  useEffect(() => { dispatch(fetchAllOrders(token)); }, []);
  useEffect(() => { if (successMsg) { const t=setTimeout(()=>dispatch(clearOrderMsg()),3000); return ()=>clearTimeout(t); } }, [successMsg]);

  function handleStatus(id, orderStatus) {
    dispatch(updateOrderStatus({ id, orderStatus, messageText: msgTxt[id]||'', token }));
  }

  const stats = {
    total:     allOrders.length,
    pending:   allOrders.filter(o=>o.orderStatus==='pending').length,
    active:    allOrders.filter(o=>o.orderStatus==='accepted').length,
    delivered: allOrders.filter(o=>o.orderStatus==='delivered').length
  };

  return (
    <div style={{ background:'#0f0f0f', minHeight:'100vh', padding:'24px' }}>
      {successMsg&&<div style={{ position:'fixed', top:'80px', right:'20px', background:'#27ae60', color:'#fff', padding:'12px 20px', borderRadius:'8px', zIndex:9999, fontSize:'14px', fontWeight:'600' }}>✅ {successMsg}</div>}
      <div style={{ maxWidth:'1000px', margin:'0 auto' }}>
        <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'36px', letterSpacing:'3px', marginBottom:'20px' }}>
          MANAGE <span style={{ color:'#e63312' }}>ORDERS</span>
        </h1>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'24px' }}>
          {[['TOTAL',stats.total,'#aaa'],['PENDING',stats.pending,'#f39c12'],['ACTIVE',stats.active,'#27ae60'],['DELIVERED',stats.delivered,'#3498db']].map(([l,v,c])=>(
            <div key={l} style={{ background:'#1a1a1a', borderRadius:'10px', padding:'16px', textAlign:'center', border:'1px solid #252525' }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'32px', color:c, letterSpacing:'1px' }}>{v}</div>
              <div style={{ fontSize:'11px', color:'#666', letterSpacing:'1.5px', marginTop:'2px' }}>{l}</div>
            </div>
          ))}
        </div>

        {loading ? <p style={{ color:'#555', textAlign:'center', padding:'40px' }}>Loading orders...</p> :
          allOrders.length===0 ? (
            <div style={{ textAlign:'center', padding:'80px', background:'#1a1a1a', borderRadius:'12px', color:'#555' }}>
              <div style={{ fontSize:'48px', marginBottom:'12px' }}>📦</div><p>No orders yet.</p>
            </div>
          ) : allOrders.map(o => {
            const st = STATUS[o.orderStatus]||STATUS.pending;
            return (
              <div key={o._id} style={{ background:'#1a1a1a', borderRadius:'12px', padding:'20px', marginBottom:'14px', border:'1px solid #252525', borderLeft:'4px solid '+st.color }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:'700', letterSpacing:'1px', marginBottom:'3px' }}>#{o._id.slice(-8).toUpperCase()}</div>
                    <div style={{ fontSize:'13px', color:'#aaa' }}>{o.userId?.name} <span style={{ color:'#555' }}>({o.userId?.email})</span></div>
                    <div style={{ fontSize:'11px', color:'#555', marginTop:'2px' }}>{new Date(o.createdAt).toLocaleString()}</div>
                  </div>
                  <div style={{ background:st.bg, border:'1px solid '+st.color, color:st.color, padding:'4px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'700', letterSpacing:'1px' }}>
                    {st.icon} {o.orderStatus.toUpperCase()}
                  </div>
                </div>
                <div style={{ padding:'12px', background:'#252525', borderRadius:'8px', marginBottom:'12px' }}>
                  {o.items.map((item,i)=><span key={i} style={{ fontSize:'13px', color:'#bbb', marginRight:'12px' }}>🍕 {item.name} ×{item.quantity}</span>)}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: o.orderStatus==='pending'||o.orderStatus==='accepted'?'12px':'0' }}>
                  <div style={{ fontSize:'12px', color:'#555', display:'flex', gap:'12px' }}>
                    <span>🚚 {o.deliveryMode}</span><span>💳 {o.paymentMode||'cash'}</span>
                  </div>
                  <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'22px', color:'#e63312' }}>₹{o.totalAmount}</span>
                </div>
                {o.orderStatus==='pending'&&(
                  <div style={{ paddingTop:'12px', borderTop:'1px solid #252525', display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center' }}>
                    <input placeholder="Custom message (optional)" value={msgTxt[o._id]||''} onChange={e=>setMsgTxt({...msgTxt,[o._id]:e.target.value})}
                      style={{ flex:1, minWidth:'200px', padding:'9px 12px', background:'#252525', border:'1px solid #333', borderRadius:'6px', color:'#fff', fontSize:'13px', outline:'none' }} />
                    <button onClick={()=>handleStatus(o._id,'accepted')} style={{ background:'rgba(39,174,96,0.15)', border:'1px solid rgba(39,174,96,0.4)', color:'#27ae60', padding:'9px 20px', borderRadius:'6px', fontSize:'13px', fontWeight:'700', cursor:'pointer' }}>✅ ACCEPT</button>
                    <button onClick={()=>handleStatus(o._id,'rejected')} style={{ background:'rgba(231,76,60,0.15)', border:'1px solid rgba(231,76,60,0.4)', color:'#e74c3c', padding:'9px 20px', borderRadius:'6px', fontSize:'13px', fontWeight:'700', cursor:'pointer' }}>❌ REJECT</button>
                  </div>
                )}
                {o.orderStatus==='accepted'&&(
                  <div style={{ paddingTop:'12px', borderTop:'1px solid #252525' }}>
                    <button onClick={()=>handleStatus(o._id,'delivered')} style={{ background:'rgba(52,152,219,0.15)', border:'1px solid rgba(52,152,219,0.4)', color:'#3498db', padding:'9px 20px', borderRadius:'6px', fontSize:'13px', fontWeight:'700', cursor:'pointer' }}>🎉 MARK DELIVERED</button>
                  </div>
                )}
              </div>
            );
          })
        }
      </div>
    </div>
  );
}
