import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { fetchCart, updateCartItem } from '../store/slices/cartSlice';
import { placeOrder, clearOrderMsg } from '../store/slices/orderSlice';
import { resetCart } from '../store/slices/cartSlice';

const addressSchema = Yup.object({
  houseNumber: Yup.string().required('House number required'),
  street:      Yup.string().required('Street required'),
  city:        Yup.string().required('City required'),
  state:       Yup.string().required('State required'),
  pincode:     Yup.string().matches(/^\d{6}$/,'Must be 6 digits').required('Pincode required')
});

export default function CartPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { items, totalAmount } = useSelector(s => s.cart);
  const { loading, error, successMsg } = useSelector(s => s.orders);
  const { token } = useSelector(s => s.auth);
  const [addresses,    setAddresses]    = useState([]);
  const [selectedAddr, setSelectedAddr] = useState('');
  const [showNewAddr,  setShowNewAddr]  = useState(false);
  const [deliveryMode, setDeliveryMode] = useState('delivery');
  const [paymentMode,  setPaymentMode]  = useState('cash');

  useEffect(() => {
    dispatch(fetchCart(token));
    fetch('/api/addresses', { headers:{'Authorization':'Bearer '+token} })
      .then(r=>r.json()).then(d=>{ if(d.success){ setAddresses(d.data); if(d.data.length>0) setSelectedAddr(d.data[0]._id); }});
  }, []);

  useEffect(() => {
    if (successMsg === 'Order placed!') {
      dispatch(resetCart());
      setTimeout(() => { dispatch(clearOrderMsg()); navigate('/orders'); }, 1000);
    }
  }, [successMsg]);

  const addrFormik = useFormik({
    initialValues: { houseNumber:'', street:'', city:'', state:'', pincode:'' },
    validationSchema: addressSchema,
    onSubmit: async (values) => {
      const res  = await fetch('/api/addresses', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body:JSON.stringify({...values,isDefault:true}) });
      const data = await res.json();
      if (data.success) { setAddresses([...addresses, data.data]); setSelectedAddr(data.data._id); setShowNewAddr(false); addrFormik.resetForm(); }
    }
  });

  function handleQty(itemId, qty) { dispatch(updateCartItem({ itemId, quantity: qty, token })); }

  function handlePlaceOrder() {
    if (!selectedAddr && !showNewAddr) { alert('Please select or add a delivery address.'); return; }
    dispatch(placeOrder({ orderData:{ addressId: selectedAddr, deliveryMode, paymentMode }, token }));
  }

  const deliveryCharge = deliveryMode==='delivery' && totalAmount < 299 ? 40 : 0;
  const grandTotal     = totalAmount + deliveryCharge;

  const inp = (name, ph) => (
    <div>
      <input name={name} placeholder={ph} value={addrFormik.values[name]}
        onChange={addrFormik.handleChange} onBlur={addrFormik.handleBlur}
        style={{ width:'100%', padding:'10px 12px', background:'#252525', border:'1px solid '+(addrFormik.touched[name]&&addrFormik.errors[name]?'#e74c3c':'#333'), borderRadius:'6px', color:'#fff', fontSize:'13px', outline:'none' }} />
      {addrFormik.touched[name]&&addrFormik.errors[name]&&<p style={{ color:'#e74c3c',fontSize:'11px',marginTop:'2px' }}>⚠ {addrFormik.errors[name]}</p>}
    </div>
  );

  return (
    <div style={{ background:'#0f0f0f', minHeight:'100vh', padding:'24px' }}>
      <div style={{ maxWidth:'1000px', margin:'0 auto' }}>
        <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'36px', letterSpacing:'3px', marginBottom:'24px' }}>
          🛒 YOUR <span style={{ color:'#e63312' }}>ORDER</span>
        </h1>

        {error && <div style={{ background:'rgba(231,76,60,0.15)', border:'1px solid rgba(231,76,60,0.4)', borderRadius:'8px', padding:'12px 16px', marginBottom:'16px', fontSize:'14px', color:'#e74c3c' }}>{error}</div>}
        {successMsg && <div style={{ background:'rgba(39,174,96,0.15)', border:'1px solid rgba(39,174,96,0.4)', borderRadius:'8px', padding:'12px 16px', marginBottom:'16px', fontSize:'14px', color:'#27ae60' }}>✅ {successMsg}</div>}

        {!items || items.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px', background:'#1a1a1a', borderRadius:'12px' }}>
            <div style={{ fontSize:'64px', marginBottom:'16px' }}>🍕</div>
            <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'28px', color:'#555', letterSpacing:'2px' }}>CART IS EMPTY</h2>
            <button onClick={()=>navigate('/')} style={{ background:'#e63312', color:'#fff', border:'none', padding:'12px 28px', borderRadius:'6px', fontSize:'14px', fontWeight:'600', marginTop:'16px', cursor:'pointer' }}>BROWSE MENU</button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:'24px' }}>
            <div>
              {/* Cart Items */}
              <div style={{ background:'#1a1a1a', borderRadius:'12px', overflow:'hidden', marginBottom:'20px' }}>
                <div style={{ padding:'14px 20px', borderBottom:'1px solid #252525' }}>
                  <span style={{ fontSize:'13px', fontWeight:'600', letterSpacing:'1px', color:'#aaa' }}>ORDER ITEMS ({items.length})</span>
                </div>
                {items.map(item => (
                  <div key={item.itemId} style={{ padding:'14px 20px', borderBottom:'1px solid #252525', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <p style={{ fontWeight:'600', fontSize:'14px' }}>{item.name}</p>
                      <p style={{ fontSize:'12px', color:'#777' }}>₹{item.price} each</p>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <button onClick={()=>handleQty(item.itemId,item.quantity-1)} style={{ background:'#252525', border:'1px solid #333', color:'#fff', width:'30px', height:'30px', borderRadius:'6px', fontSize:'16px', cursor:'pointer' }}>−</button>
                      <span style={{ fontSize:'16px', fontWeight:'700', minWidth:'22px', textAlign:'center', color:'#e63312' }}>{item.quantity}</span>
                      <button onClick={()=>handleQty(item.itemId,item.quantity+1)} style={{ background:'#e63312', border:'none', color:'#fff', width:'30px', height:'30px', borderRadius:'6px', fontSize:'16px', cursor:'pointer' }}>+</button>
                      <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'18px', minWidth:'65px', textAlign:'right' }}>₹{item.price*item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Address */}
              <div style={{ background:'#1a1a1a', borderRadius:'12px', padding:'20px', marginBottom:'20px' }}>
                <h3 style={{ fontSize:'13px', fontWeight:'600', letterSpacing:'1px', color:'#aaa', marginBottom:'12px' }}>📍 DELIVERY ADDRESS</h3>
                <select value={selectedAddr} onChange={e=>setSelectedAddr(e.target.value)}
                  style={{ width:'100%', padding:'11px 14px', background:'#252525', border:'1px solid #333', borderRadius:'6px', color:selectedAddr?'#fff':'#777', fontSize:'14px', marginBottom:'10px' }}>
                  <option value="">-- Select Address --</option>
                  {addresses.map(a=>(<option key={a._id} value={a._id}>{a.houseNumber}, {a.street}, {a.city} - {a.pincode}</option>))}
                </select>
                <button onClick={()=>setShowNewAddr(!showNewAddr)} style={{ background:'none', border:'1px dashed #e63312', color:'#e63312', padding:'7px 14px', borderRadius:'6px', fontSize:'13px', fontWeight:'600', cursor:'pointer' }}>
                  + Add New Address
                </button>
                {showNewAddr && (
                  <form onSubmit={addrFormik.handleSubmit} style={{ marginTop:'14px' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                      {inp('houseNumber','House/Flat No.')}
                      {inp('street','Street / Area')}
                      {inp('city','City')}
                      {inp('state','State')}
                      {inp('pincode','Pincode (6 digits)')}
                    </div>
                    <button type="submit" style={{ width:'100%', background:'#e63312', color:'#fff', border:'none', padding:'10px', borderRadius:'6px', fontSize:'13px', fontWeight:'700', marginTop:'10px', cursor:'pointer', letterSpacing:'1px' }}>SAVE ADDRESS</button>
                  </form>
                )}
              </div>

              {/* Delivery + Payment */}
              <div style={{ background:'#1a1a1a', borderRadius:'12px', padding:'20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
                <div>
                  <h3 style={{ fontSize:'13px', fontWeight:'600', letterSpacing:'1px', color:'#aaa', marginBottom:'12px' }}>🚚 DELIVERY MODE</h3>
                  {[['delivery','🚚 Home Delivery'],['pickup','🏪 Pick Up']].map(([m,l])=>(
                    <label key={m} onClick={()=>setDeliveryMode(m)} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px', cursor:'pointer' }}>
                      <div style={{ width:'18px', height:'18px', borderRadius:'50%', border:'2px solid #e63312', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {deliveryMode===m&&<div style={{ width:'10px', height:'10px', borderRadius:'50%', background:'#e63312' }}/>}
                      </div>
                      <span style={{ fontSize:'14px', color:deliveryMode===m?'#fff':'#888' }}>{l}</span>
                    </label>
                  ))}
                </div>
                <div>
                  <h3 style={{ fontSize:'13px', fontWeight:'600', letterSpacing:'1px', color:'#aaa', marginBottom:'12px' }}>💳 PAYMENT</h3>
                  {[['cash','💵 Cash on Delivery'],['card','💳 Card'],['upi','📱 UPI']].map(([m,l])=>(
                    <label key={m} onClick={()=>setPaymentMode(m)} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px', cursor:'pointer' }}>
                      <div style={{ width:'18px', height:'18px', borderRadius:'50%', border:'2px solid #e63312', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {paymentMode===m&&<div style={{ width:'10px', height:'10px', borderRadius:'50%', background:'#e63312' }}/>}
                      </div>
                      <span style={{ fontSize:'14px', color:paymentMode===m?'#fff':'#888' }}>{l}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div style={{ background:'#1a1a1a', borderRadius:'12px', padding:'20px', position:'sticky', top:'90px' }}>
                <h3 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'22px', letterSpacing:'2px', marginBottom:'18px', borderBottom:'1px solid #252525', paddingBottom:'12px' }}>ORDER SUMMARY</h3>
                {items.map(item=>(
                  <div key={item.itemId} style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'13px', color:'#aaa' }}>
                    <span>{item.name} ×{item.quantity}</span><span>₹{item.price*item.quantity}</span>
                  </div>
                ))}
                <div style={{ borderTop:'1px solid #252525', marginTop:'12px', paddingTop:'12px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#777', marginBottom:'8px' }}>
                    <span>Subtotal</span><span>₹{totalAmount}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', color:deliveryCharge===0?'#27ae60':'#777', marginBottom:'8px' }}>
                    <span>Delivery</span><span>{deliveryCharge===0?'FREE':'₹'+deliveryCharge}</span>
                  </div>
                  <div style={{ borderTop:'1px solid #333', paddingTop:'12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontWeight:'700', fontSize:'16px' }}>TOTAL</span>
                    <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'26px', color:'#e63312' }}>₹{grandTotal}</span>
                  </div>
                </div>
                <button onClick={handlePlaceOrder} disabled={loading}
                  style={{ width:'100%', background:loading?'#555':'#e63312', color:'#fff', border:'none', padding:'14px', borderRadius:'8px', fontSize:'15px', fontWeight:'700', letterSpacing:'1.5px', marginTop:'18px', cursor:'pointer' }}>
                  {loading ? '⏳ PLACING...' : `🍕 PLACE ORDER — ₹${grandTotal}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
