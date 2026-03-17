import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { registerUser, clearError } from '../store/slices/authSlice';

const schema = Yup.object({
  name:     Yup.string().min(2,'Min 2 characters').required('Name is required'),
  email:    Yup.string().email('Invalid email').required('Email is required'),
  phone:    Yup.string().matches(/^[0-9+\s-]{10,13}$/,'Invalid phone number'),
  password: Yup.string().min(6,'Min 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')],'Passwords do not match')
    .required('Please confirm password')
});

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector(s => s.auth);
  const [showPwd, setShowPwd] = React.useState(false);

  useEffect(() => { dispatch(clearError()); }, []);
  useEffect(() => { if (user) navigate('/'); }, [user]);

  const formik = useFormik({
    initialValues: { name:'', email:'', phone:'', password:'', confirmPassword:'' },
    validationSchema: schema,
    onSubmit: ({ name, email, phone, password }) => dispatch(registerUser({ name, email, phone, password }))
  });

  const fields = [
    { name:'name',            type:'text',     ph:'John Doe',          label:'FULL NAME' },
    { name:'email',           type:'email',    ph:'you@example.com',   label:'EMAIL ADDRESS' },
    { name:'phone',           type:'text',     ph:'+91 98765 43210',   label:'PHONE (OPTIONAL)' },
    { name:'password',        type:'password', ph:'Min 6 characters',  label:'PASSWORD' },
    { name:'confirmPassword', type:'password', ph:'Re-enter password', label:'CONFIRM PASSWORD' }
  ];

  return (
    <div style={{ minHeight:'100vh', background:'#0f0f0f', display:'flex' }}>
      <div style={{ flex:1, background:'linear-gradient(135deg,#e63312,#8B0000)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px', overflow:'hidden', position:'relative' }}>
        <div style={{ position:'absolute', top:'-100px', left:'-100px', width:'400px', height:'400px', borderRadius:'50%', background:'rgba(255,255,255,0.05)' }}/>
        <div style={{ fontSize:'80px', marginBottom:'16px' }}>🍕</div>
        <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'48px', letterSpacing:'3px', textAlign:'center' }}>JOIN THE FAMILY</h1>
        <p style={{ opacity:0.85, textAlign:'center', maxWidth:'280px', lineHeight:'1.7', marginTop:'10px' }}>Create your account and start ordering delicious pizzas today!</p>
        <div style={{ marginTop:'24px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', width:'100%', maxWidth:'300px' }}>
          {[['⚡','30 Min Delivery'],['🌿','Fresh Daily'],['💯','Best Quality'],['💰','Great Prices']].map(([ic,t])=>(
            <div key={t} style={{ background:'rgba(255,255,255,0.1)', borderRadius:'8px', padding:'12px', textAlign:'center', fontSize:'12px' }}>
              <div style={{ fontSize:'20px', marginBottom:'4px' }}>{ic}</div>{t}
            </div>
          ))}
        </div>
      </div>

      <div style={{ width:'480px', background:'#1a1a1a', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px', overflowY:'auto' }}>
        <div style={{ width:'100%', maxWidth:'380px' }}>
          <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'32px', letterSpacing:'2px', marginBottom:'6px' }}>CREATE ACCOUNT</h2>
          <p style={{ color:'#888', fontSize:'14px', marginBottom:'20px' }}>Fill in your details to get started</p>

          {error && <div style={{ background:'rgba(231,76,60,0.15)', border:'1px solid rgba(231,76,60,0.4)', borderRadius:'6px', padding:'10px 14px', marginBottom:'16px', fontSize:'13px', color:'#e74c3c' }}>{error}</div>}

          <form onSubmit={formik.handleSubmit}>
            {fields.map(({ name, type, ph, label }) => (
              <div key={name} style={{ marginBottom:'14px' }}>
                <label style={{ fontSize:'11px', fontWeight:'600', color:'#888', letterSpacing:'1px', display:'block', marginBottom:'5px' }}>{label}</label>
                <div style={{ position:'relative' }}>
                  <input
                    name={name}
                    type={(name==='password'||name==='confirmPassword') && showPwd ? 'text' : type}
                    value={formik.values[name]}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={ph}
                    style={{ width:'100%', padding:'11px 14px', background:'#252525', border:'1px solid '+(formik.touched[name]&&formik.errors[name]?'#e74c3c':'#333'), borderRadius:'6px', color:'#fff', fontSize:'14px', outline:'none' }}
                  />
                  {(name==='password') && (
                    <button type="button" onClick={()=>setShowPwd(!showPwd)}
                      style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#888', fontSize:'15px', cursor:'pointer' }}>
                      {showPwd?'🙈':'👁️'}
                    </button>
                  )}
                </div>
                {formik.touched[name] && formik.errors[name] && (
                  <p style={{ color:'#e74c3c', fontSize:'11px', marginTop:'3px' }}>⚠ {formik.errors[name]}</p>
                )}
              </div>
            ))}
            <button type="submit" disabled={loading}
              style={{ width:'100%', background:loading?'#555':'#e63312', color:'#fff', border:'none', padding:'13px', borderRadius:'6px', fontSize:'14px', fontWeight:'700', letterSpacing:'1.5px', marginTop:'8px', cursor:'pointer' }}>
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>
          </form>
          <p style={{ textAlign:'center', marginTop:'16px', fontSize:'13px', color:'#888' }}>
            Already have an account? <Link to="/login" style={{ color:'#e63312', fontWeight:'600' }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
