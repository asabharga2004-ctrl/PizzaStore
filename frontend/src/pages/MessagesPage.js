import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, markMessageRead } from '../store/slices/messageSlice';

export default function MessagesPage({ onRead }) {
  const dispatch = useDispatch();
  const { messages, loading } = useSelector(s => s.messages);
  const { token } = useSelector(s => s.auth);
  const unread = messages.filter(m => !m.isRead).length;

  useEffect(() => { dispatch(fetchMessages(token)); }, []);

  function handleRead(id) {
    dispatch(markMessageRead({ id, token }));
    if (onRead) onRead();
  }

  return (
    <div style={{ background:'#0f0f0f', minHeight:'100vh', padding:'24px' }}>
      <div style={{ maxWidth:'700px', margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
          <div>
            <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'36px', letterSpacing:'3px' }}>
              ORDER <span style={{ color:'#e63312' }}>ALERTS</span>
            </h1>
            <p style={{ color:'#666', fontSize:'14px' }}>{unread>0?`${unread} unread`:'All caught up!'}</p>
          </div>
          {unread>0&&<div style={{ background:'#e63312', borderRadius:'50%', width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700' }}>{unread}</div>}
        </div>

        {loading ? <p style={{ color:'#555', textAlign:'center', padding:'40px' }}>Loading...</p> :
          messages.length===0 ? (
            <div style={{ textAlign:'center', padding:'80px', background:'#1a1a1a', borderRadius:'12px' }}>
              <div style={{ fontSize:'64px', marginBottom:'16px' }}>📩</div>
              <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'24px', letterSpacing:'2px', color:'#555' }}>NO MESSAGES YET</h2>
            </div>
          ) : messages.map(m=>(
            <div key={m._id} onClick={()=>!m.isRead&&handleRead(m._id)}
              style={{ background:m.isRead?'#1a1a1a':'#1f1510', border:'1px solid '+(m.isRead?'#252525':'#e63312'), borderRadius:'12px', padding:'16px 20px', marginBottom:'12px', cursor:m.isRead?'default':'pointer' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ display:'flex', gap:'12px', flex:1 }}>
                  <div style={{ fontSize:'24px' }}>{m.isRead?'📩':'🔔'}</div>
                  <div>
                    <p style={{ fontSize:'14px', color:'#fff', marginBottom:'6px', lineHeight:'1.5' }}>{m.message}</p>
                    <p style={{ fontSize:'11px', color:'#555' }}>{new Date(m.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {!m.isRead&&<div style={{ background:'#e63312', color:'#fff', fontSize:'10px', fontWeight:'700', padding:'2px 8px', borderRadius:'10px', marginLeft:'12px' }}>NEW</div>}
              </div>
              {!m.isRead&&<p style={{ fontSize:'11px', color:'#e63312', marginTop:'8px', fontStyle:'italic' }}>Click to mark as read</p>}
            </div>
          ))
        }
      </div>
    </div>
  );
}
