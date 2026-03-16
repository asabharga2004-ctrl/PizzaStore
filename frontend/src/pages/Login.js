import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { loginUser, clearError } from '../store/slices/authSlice';

const schema = Yup.object({
  email:    Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6,'Min 6 characters').required('Password is required')
});

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector(s => s.auth);
  const [showPwd, setShowPwd] = React.useState(false);

  useEffect(() => { dispatch(clearError()); }, []);
  useEffect(() => { if (user) navigate(user.role === 'admin' ? '/admin/orders' : '/'); }, [user]);

  const formik = useFormik({
    initialValues: { email:'', password:'' },
    validationSchema: schema,
    onSubmit: values => { dispatch(loginUser(values)); }
  });

  const inp = (name, type='text', ph='') => (
    <div style={{ marginBottom:'16px' }}>
      <label style={{ fontSize:'11px', fontWeight:'600', color:'#888', letterSpacing:'1px', display:'block', marginBottom:'6px' }}>
        {name.toUpperCase()}
      </label>
      <input
        name={name} type={showPwd && name==='password' ? 'text' : type}
        value={formik.values[name]} onChange={formik.handleChange} onBlur={formik.handleBlur}
        placeholder={ph}
        style={{ width:'100%', padding:'12px 14px', background:'#252525', border:'1px solid '+(formik.touched[name]&&formik.errors[name]?'#e74c3c':'#333'), borderRadius:'6px', color:'#fff', fontSize:'14px', outline:'none' }}
      />
      {name==='password' && (
        <button type="button" onClick={()=>setShowPwd(!showPwd)}
          style={{ position:'absolute', right:'12px', marginTop:'-36px', background:'none', border:'none', color:'#888', fontSize:'16px', cursor:'pointer' }}>
          {showPwd?'🙈':'👁️'}
        </button>
      )}
      {formik.touched[name] && formik.errors[name] && (
        <p style={{ color:'#e74c3c', fontSize:'12px', marginTop:'4px' }}>⚠ {formik.errors[name]}</p>
      )}
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#0f0f0f', display:'flex' }}>
      <div style={{ flex:1, background:'linear-gradient(135deg,#e63312,#8B0000)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px', overflow:'hidden', position:'relative' }}>
        <div style={{ position:'absolute', top:'-100px', left:'-100px', width:'400px', height:'400px', borderRadius:'50%', background:'rgba(255,255,255,0.05)' }}/>
        <div style={{ fontSize:'90px', marginBottom:'16px' }}>🍕</div>
        <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'52px', letterSpacing:'4px', textAlign:'center' }}>PIZZA STORE</h1>
        <p style={{ opacity:0.85, textAlign:'center', maxWidth:'280px', lineHeight:'1.7', fontSize:'15px', marginTop:'10px' }}>Hot & Fresh pizzas delivered in 30 minutes!</p>
        <div style={{ marginTop:'30px', display:'flex', gap:'24px' }}>
          {[['⚡','30 Min'],['🌿','Fresh'],['💰','Best Price']].map(([ic,t])=>(
            <div key={t} style={{ textAlign:'center', fontSize:'12px', opacity:0.85 }}>
              <div style={{ fontSize:'22px', marginBottom:'4px' }}>{ic}</div>{t}
            </div>
          ))}
        </div>
      </div>

      <div style={{ width:'460px', background:'#1a1a1a', display:'flex', alignItems:'center', justifyContent:'center', padding:'50px 40px' }}>
        <div style={{ width:'100%', maxWidth:'360px' }}>
          <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'32px', letterSpacing:'2px', marginBottom:'6px' }}>WELCOME BACK</h2>
          <p style={{ color:'#888', fontSize:'14px', marginBottom:'24px' }}>Login to order your favourite pizza</p>

          {error && <div style={{ background:'rgba(231,76,60,0.15)', border:'1px solid rgba(231,76,60,0.4)', borderRadius:'6px', padding:'10px 14px', marginBottom:'16px', fontSize:'13px', color:'#e74c3c' }}>{error}</div>}

          <form onSubmit={formik.handleSubmit}>
            {inp('email','email','you@example.com')}
            <div style={{ position:'relative' }}>
              {inp('password','password','••••••••')}
            </div>
            <button type="submit" disabled={loading}
              style={{ width:'100%', background:loading?'#555':'#e63312', color:'#fff', border:'none', padding:'14px', borderRadius:'6px', fontSize:'14px', fontWeight:'700', letterSpacing:'1.5px', marginTop:'8px', cursor:'pointer' }}>
              {loading ? 'LOGGING IN...' : 'LOGIN & ORDER NOW'}
            </button>
          </form>
          <p style={{ textAlign:'center', marginTop:'20px', fontSize:'13px', color:'#888' }}>
            New here? <Link to="/register" style={{ color:'#e63312', fontWeight:'600' }}>Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
