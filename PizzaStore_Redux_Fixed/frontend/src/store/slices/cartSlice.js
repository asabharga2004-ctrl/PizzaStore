import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api';

export const fetchCart = createAsyncThunk('cart/fetch', async (token, { rejectWithValue }) => {
  try {
    const res  = await fetch(`${API}/api/cart`, { headers:{'Authorization':'Bearer '+token} });
    const data = await res.json();
    if (!data.success) return rejectWithValue(data.message);
    return data.data;
  } catch { return rejectWithValue('Failed to fetch cart'); }
});

export const addToCart = createAsyncThunk('cart/add', async ({ itemId, quantity=1, token }, { rejectWithValue }) => {
  try {
    const res  = await fetch(`${API}/api/cart/add`, { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body:JSON.stringify({itemId,quantity}) });
    const data = await res.json();
    if (!data.success) return rejectWithValue(data.message);
    return data.data;
  } catch { return rejectWithValue('Failed to add item'); }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity, token }, { rejectWithValue }) => {
  try {
    const res  = await fetch(`${API}/api/cart/update`, { method:'PUT', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body:JSON.stringify({itemId,quantity}) });
    const data = await res.json();
    if (!data.success) return rejectWithValue(data.message);
    return data.data;
  } catch { return rejectWithValue('Failed to update cart'); }
});

export const clearCart = createAsyncThunk('cart/clear', async (token, { rejectWithValue }) => {
  try {
    const res  = await fetch(`${API}/api/cart/clear`, { method:'DELETE', headers:{'Authorization':'Bearer '+token} });
    const data = await res.json();
    if (!data.success) return rejectWithValue(data.message);
    return { items:[], totalAmount:0 };
  } catch { return rejectWithValue('Failed to clear cart'); }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items:[], totalAmount:0, loading:false, error:'', successMsg:'' },
  reducers: {
    clearCartMsg: s => { s.successMsg=''; s.error=''; },
    resetCart:    s => { s.items=[]; s.totalAmount=0; }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCart.fulfilled,      (s,a) => { s.items=a.payload.items||[]; s.totalAmount=a.payload.totalAmount||0; })
      .addCase(addToCart.pending,        s     => { s.loading=true; s.error=''; s.successMsg=''; })
      .addCase(addToCart.fulfilled,      (s,a) => { s.loading=false; s.items=a.payload.items||[]; s.totalAmount=a.payload.totalAmount||0; s.successMsg='Added to cart!'; })
      .addCase(addToCart.rejected,       (s,a) => { s.loading=false; s.error=a.payload; })
      .addCase(updateCartItem.fulfilled,  (s,a) => { s.items=a.payload.items||[]; s.totalAmount=a.payload.totalAmount||0; })
      .addCase(clearCart.fulfilled,      (s,a) => { s.items=[]; s.totalAmount=0; });
  }
});

export const { clearCartMsg, resetCart } = cartSlice.actions;
export default cartSlice.reducer;
