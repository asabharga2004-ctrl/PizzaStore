import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { fetchMenuItems, fetchCategories, createMenuItem, updateMenuItem, deleteMenuItem, clearMenuError } from '../store/slices/menuSlice';

const schema = Yup.object({
  name:        Yup.string().required('Name is required'),
  price:       Yup.number().typeError('Must be a number').positive('Must be positive').required('Price is required'),
  categoryId:  Yup.string().required('Category is required'),
  description: Yup.string()
});

export default function AdminMenu() {
  const dispatch = useDispatch();
  const { items, categories, loading, error } = useSelector(s => s.menu);
  const { token } = useSelector(s => s.auth);
  const [editId, setEditId] = React.useState(null);
  const [toast,  setToast]  = React.useState('');

  useEffect(() => { dispatch(fetchMenuItems()); dispatch(fetchCategories()); }, []);

  function showToast(msg) { setToast(msg); setTimeout(()=>setToast(''),3000); }

  const formik = useFormik({
    initialValues: { name:'', description:'', price:'', categoryId:'', isAvailable:true },
    validationSchema: schema,
    onSubmit: async (values, { resetForm }) => {
      if (editId) {
        await dispatch(updateMenuItem({ id:editId, formData:values, token }));
        showToast('Item updated!'); setEditId(null);
      } else {
        await dispatch(createMenuItem({ formData:values, token }));
        showToast('Item added!');
      }
      resetForm();
    }
  });

  function startEdit(item) {
    setEditId(item._id);
    formik.setValues({ name:item.name, description:item.description||'', price:item.price, categoryId:item.categoryId?._id||'', isAvailable:item.isAvailable });
    window.scrollTo({ top:0, behavior:'smooth' });
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this item?')) return;
    await dispatch(deleteMenuItem({ id, token }));
    showToast('Item deleted!');
  }

  const inp = (name, type='text', ph='') => (
    <div>
      <input name={name} type={type} placeholder={ph} value={formik.values[name]}
        onChange={formik.handleChange} onBlur={formik.handleBlur}
        style={{ width:'100%', padding:'10px 12px', background:'#252525', border:'1px solid '+(formik.touched[name]&&formik.errors[name]?'#e74c3c':'#333'), borderRadius:'6px', color:'#fff', fontSize:'14px', outline:'none' }} />
      {formik.touched[name]&&formik.errors[name]&&<p style={{ color:'#e74c3c',fontSize:'11px',marginTop:'2px' }}>⚠ {formik.errors[name]}</p>}
    </div>
  );

  return (
    <div style={{ background:'#0f0f0f', minHeight:'100vh', padding:'24px' }}>
      {toast&&<div style={{ position:'fixed', top:'80px', right:'20px', background:toast.includes('deleted')?'#e74c3c':'#27ae60', color:'#fff', padding:'12px 20px', borderRadius:'8px', zIndex:9999, fontSize:'14px', fontWeight:'600' }}>{toast}</div>}
      <div style={{ maxWidth:'1000px', margin:'0 auto' }}>
        <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'36px', letterSpacing:'3px', marginBottom:'24px' }}>
          MENU <span style={{ color:'#e63312' }}>MANAGEMENT</span>
        </h1>

        {/* Form */}
        <div style={{ background:'#1a1a1a', borderRadius:'12px', padding:'20px', marginBottom:'24px' }}>
          <h3 style={{ fontSize:'13px', fontWeight:'600', letterSpacing:'1px', color:'#aaa', marginBottom:'14px' }}>
            {editId ? '✏️ EDIT ITEM' : '➕ ADD NEW ITEM'}
          </h3>
          <form onSubmit={formik.handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
              {inp('name','text','Item Name *')}
              {inp('price','number','Price (₹) *')}
              {inp('description','text','Description')}
              <div>
                <select name="categoryId" value={formik.values.categoryId} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  style={{ width:'100%', padding:'10px 12px', background:'#252525', border:'1px solid '+(formik.touched.categoryId&&formik.errors.categoryId?'#e74c3c':'#333'), borderRadius:'6px', color:formik.values.categoryId?'#fff':'#777', fontSize:'14px', outline:'none' }}>
                  <option value="">-- Select Category *</option>
                  {categories.map(c=><option key={c._id} value={c._id}>{c.categoryName}</option>)}
                </select>
                {formik.touched.categoryId&&formik.errors.categoryId&&<p style={{ color:'#e74c3c',fontSize:'11px',marginTop:'2px' }}>⚠ {formik.errors.categoryId}</p>}
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'14px', color:'#aaa', cursor:'pointer' }}>
                <input type="checkbox" name="isAvailable" checked={formik.values.isAvailable} onChange={formik.handleChange} />
                Available for ordering
              </label>
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button type="submit" disabled={loading} style={{ background:'#e63312', color:'#fff', border:'none', padding:'10px 24px', borderRadius:'6px', fontSize:'13px', fontWeight:'700', letterSpacing:'1px', cursor:'pointer' }}>
                {loading ? '...' : editId ? 'UPDATE ITEM' : 'ADD ITEM'}
              </button>
              {editId&&<button type="button" onClick={()=>{setEditId(null);formik.resetForm();}} style={{ background:'#252525', color:'#aaa', border:'1px solid #333', padding:'10px 20px', borderRadius:'6px', fontSize:'13px', cursor:'pointer' }}>Cancel</button>}
            </div>
          </form>
        </div>

        {/* Table */}
        <div style={{ background:'#1a1a1a', borderRadius:'12px', overflow:'hidden' }}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid #252525' }}>
            <span style={{ fontSize:'13px', fontWeight:'600', letterSpacing:'1px', color:'#aaa' }}>ALL ITEMS ({items.length})</span>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#252525' }}>
                {['NAME','CATEGORY','PRICE','STATUS','ACTIONS'].map(h=>(
                  <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:'11px', fontWeight:'700', letterSpacing:'1.5px', color:'#888' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item=>(
                <tr key={item._id} style={{ borderBottom:'1px solid #252525' }}>
                  <td style={{ padding:'14px 16px' }}>
                    <div style={{ fontWeight:'500', fontSize:'14px' }}>{item.name}</div>
                    <div style={{ fontSize:'12px', color:'#555', marginTop:'2px' }}>{item.description}</div>
                  </td>
                  <td style={{ padding:'14px 16px', fontSize:'13px', color:'#aaa' }}>{item.categoryId?.categoryName}</td>
                  <td style={{ padding:'14px 16px', fontFamily:"'Bebas Neue',sans-serif", fontSize:'18px', color:'#e63312' }}>₹{item.price}</td>
                  <td style={{ padding:'14px 16px' }}>
                    <span style={{ background:item.isAvailable?'rgba(39,174,96,0.15)':'rgba(127,140,141,0.15)', color:item.isAvailable?'#27ae60':'#7f8c8d', padding:'3px 10px', borderRadius:'12px', fontSize:'11px', fontWeight:'700' }}>
                      {item.isAvailable?'AVAILABLE':'UNAVAILABLE'}
                    </span>
                  </td>
                  <td style={{ padding:'14px 16px' }}>
                    <button onClick={()=>startEdit(item)} style={{ background:'rgba(41,128,185,0.15)', border:'1px solid rgba(41,128,185,0.4)', color:'#3498db', padding:'5px 14px', borderRadius:'4px', fontSize:'12px', fontWeight:'600', marginRight:'8px', cursor:'pointer' }}>EDIT</button>
                    <button onClick={()=>handleDelete(item._id)} style={{ background:'rgba(231,76,60,0.15)', border:'1px solid rgba(231,76,60,0.4)', color:'#e74c3c', padding:'5px 14px', borderRadius:'4px', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>DELETE</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
