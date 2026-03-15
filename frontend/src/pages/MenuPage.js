import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMenuItems, fetchCategories, setSelectedCategory, setSearchQuery } from '../store/slices/menuSlice';
import { addToCart, clearCartMsg } from '../store/slices/cartSlice';

const EMOJI = {'Pizza':'🍕','Sides':'🥖','Beverages':'🥤','Combo':'🎁','New Launches':'✨','Bestsellers':'⭐'};

export default function MenuPage() {
  const dispatch = useDispatch();
  const { items, categories, loading, error, selectedCategory, searchQuery } = useSelector(s => s.menu);
  const { successMsg, loading: cartLoading } = useSelector(s => s.cart);
  const { token } = useSelector(s => s.auth);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchMenuItems());
  }, [dispatch]);

  useEffect(() => {
    if (successMsg) { const t = setTimeout(() => dispatch(clearCartMsg()), 2500); return () => clearTimeout(t); }
  }, [successMsg]);

  function handleAdd(item) {
    if (!token) { alert('Please login to order!'); return; }
    dispatch(addToCart({ itemId: item._id, quantity: 1, token }));
  }

  const filtered = items.filter(i => {
    const matchCat = selectedCategory === 'All' || i.categoryId?.categoryName === selectedCategory;
    const matchSrc = i.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSrc && i.isAvailable;
  });

  return (
    <div style={{ background:'#0f0f0f', minHeight:'100vh' }}>
      {successMsg && (
        <div style={{ position:'fixed', top:'80px', right:'20px', background:'#e63312', color:'#fff', padding:'12px 20px', borderRadius:'8px', zIndex:9999, fontSize:'14px', fontWeight:'500', boxShadow:'0 4px 20px rgba(0,0,0,0.4)' }}>
          🛒 {successMsg}
        </div>
      )}

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#1a0a0a,#2d0f0f,#1a0a0a)', padding:'36px 24px', textAlign:'center', borderBottom:'2px solid #e63312', position:'relative' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 20% 50%, rgba(230,51,18,0.15) 0%,transparent 50%), radial-gradient(circle at 80% 50%, rgba(230,51,18,0.1) 0%,transparent 50%)' }}/>
        <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'52px', letterSpacing:'4px', marginBottom:'8px', position:'relative' }}>
          <span style={{ color:'#e63312' }}>HOT</span> & FRESH MENU
        </h1>
        <p style={{ color:'#aaa', fontSize:'15px', marginBottom:'20px', position:'relative' }}>Handcrafted with love • Delivered in 30 minutes</p>
        <div style={{ position:'relative', maxWidth:'400px', margin:'0 auto' }}>
          <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'16px' }}>🔍</span>
          <input type="text" placeholder="Search pizzas, sides..." value={searchQuery}
            onChange={e => dispatch(setSearchQuery(e.target.value))}
            style={{ width:'100%', padding:'12px 14px 12px 42px', background:'#252525', border:'2px solid #333', borderRadius:'25px', color:'#fff', fontSize:'14px', outline:'none' }}
            onFocus={e => e.target.style.borderColor='#e63312'}
            onBlur={e  => e.target.style.borderColor='#333'} />
        </div>
      </div>

      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'24px' }}>
        {/* Category pills */}
        <div style={{ display:'flex', gap:'10px', overflowX:'auto', paddingBottom:'8px', marginBottom:'24px' }}>
          {['All', ...categories.map(c=>c.categoryName)].map(cat => (
            <button key={cat} onClick={() => dispatch(setSelectedCategory(cat))}
              style={{ whiteSpace:'nowrap', padding:'10px 20px', borderRadius:'25px', border:'2px solid', fontSize:'13px', fontWeight:'600', letterSpacing:'0.5px', cursor:'pointer',
                borderColor: selectedCategory===cat?'#e63312':'#333',
                background:  selectedCategory===cat?'#e63312':'transparent',
                color:       selectedCategory===cat?'#fff':'#aaa' }}>
              {EMOJI[cat]||'🍴'} {cat.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ color:'#666', fontSize:'13px', marginBottom:'20px' }}>
          Showing <span style={{ color:'#e63312', fontWeight:'600' }}>{filtered.length}</span> items
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'60px', color:'#555' }}>
            <div style={{ fontSize:'36px', marginBottom:'12px' }}>🍕</div>
            <p>Loading menu...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px', color:'#555' }}>
            <div style={{ fontSize:'48px', marginBottom:'12px' }}>😕</div>
            <p>No items found.</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'20px' }}>
            {filtered.map(item => (
              <div key={item._id}
                style={{ background:'#1a1a1a', borderRadius:'12px', overflow:'hidden', border:'1px solid #252525', transition:'transform 0.2s,border-color 0.2s' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.borderColor='#e63312';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.borderColor='#252525';}}>
                <div style={{ background:'linear-gradient(135deg,#2d0f0f,#1a1a1a)', height:'140px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'60px', position:'relative' }}>
                  {EMOJI[item.categoryId?.categoryName]||'🍕'}
                  <div style={{ position:'absolute', top:'10px', right:'10px', background:'#e63312', color:'#fff', fontSize:'10px', fontWeight:'700', padding:'3px 8px', borderRadius:'12px' }}>
                    {item.categoryId?.categoryName?.toUpperCase()||'ITEM'}
                  </div>
                </div>
                <div style={{ padding:'16px' }}>
                  <h3 style={{ fontSize:'15px', fontWeight:'600', marginBottom:'6px' }}>{item.name}</h3>
                  <p style={{ fontSize:'12px', color:'#777', marginBottom:'14px', lineHeight:'1.5', minHeight:'36px' }}>{item.description||'Freshly prepared with the finest ingredients'}</p>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'22px', color:'#e63312', letterSpacing:'1px' }}>₹{item.price}</span>
                    <button onClick={()=>handleAdd(item)} disabled={cartLoading}
                      style={{ background:'#e63312', color:'#fff', border:'none', padding:'8px 18px', borderRadius:'6px', fontSize:'13px', fontWeight:'600', cursor:'pointer' }}>
                      + ADD
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
