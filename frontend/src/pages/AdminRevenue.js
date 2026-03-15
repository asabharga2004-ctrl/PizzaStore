import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRevenue } from '../store/slices/orderSlice';

const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminRevenue() {
  const dispatch = useDispatch();
  const { revenue } = useSelector(s => s.orders);
  const { token }   = useSelector(s => s.auth);

  useEffect(() => { dispatch(fetchRevenue(token)); }, []);

  const total   = revenue.reduce((s,r)=>s+r.total,0);
  const orders  = revenue.reduce((s,r)=>s+r.count,0);
  const highest = revenue.length>0 ? Math.max(...revenue.map(r=>r.total)) : 0;

  return (
    <div style={{ background:'#0f0f0f', minHeight:'100vh', padding:'24px' }}>
      <div style={{ maxWidth:'800px', margin:'0 auto' }}>
        <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'36px', letterSpacing:'3px', marginBottom:'24px' }}>
          MONTHLY <span style={{ color:'#e63312' }}>REVENUE</span>
        </h1>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', marginBottom:'28px' }}>
          {[['TOTAL REVENUE','₹'+total.toLocaleString(),'#e63312'],['TOTAL ORDERS',orders,'#27ae60'],['BEST MONTH','₹'+highest.toLocaleString(),'#f39c12']].map(([l,v,c])=>(
            <div key={l} style={{ background:'#1a1a1a', borderRadius:'12px', padding:'20px', border:'1px solid #252525', textAlign:'center' }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'28px', color:c, letterSpacing:'1px', marginBottom:'4px' }}>{v}</div>
              <div style={{ fontSize:'11px', color:'#666', letterSpacing:'1.5px' }}>{l}</div>
            </div>
          ))}
        </div>
        {revenue.length===0 ? (
          <div style={{ textAlign:'center', padding:'80px', background:'#1a1a1a', borderRadius:'12px', color:'#555' }}>
            <div style={{ fontSize:'48px', marginBottom:'12px' }}>📊</div>
            <p>No revenue data yet. Start accepting orders!</p>
          </div>
        ) : (
          <div style={{ background:'#1a1a1a', borderRadius:'12px', overflow:'hidden' }}>
            <div style={{ padding:'14px 20px', borderBottom:'1px solid #252525' }}>
              <span style={{ fontSize:'13px', fontWeight:'600', letterSpacing:'1px', color:'#aaa' }}>MONTHLY BREAKDOWN</span>
            </div>
            {revenue.map((r,i)=>{
              const pct = highest>0?(r.total/highest)*100:0;
              return (
                <div key={i} style={{ padding:'16px 20px', borderBottom:'1px solid #252525' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                    <div>
                      <span style={{ fontWeight:'600', fontSize:'15px' }}>{MONTHS[r._id.month]} {r._id.year}</span>
                      <span style={{ fontSize:'12px', color:'#555', marginLeft:'10px' }}>{r.count} order{r.count!==1?'s':''}</span>
                    </div>
                    <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'22px', color:'#e63312' }}>₹{r.total.toLocaleString()}</span>
                  </div>
                  <div style={{ background:'#252525', borderRadius:'4px', height:'6px', overflow:'hidden' }}>
                    <div style={{ width:pct+'%', height:'100%', background:'linear-gradient(90deg,#e63312,#f39c12)', borderRadius:'4px' }}/>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
