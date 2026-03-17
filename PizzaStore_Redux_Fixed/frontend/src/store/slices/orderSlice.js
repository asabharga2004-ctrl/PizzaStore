import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api';

export const fetchMyOrders = createAsyncThunk('orders/fetchMy', async (token, { rejectWithValue }) => {
  try {
    const res  = await fetch(`${API}/api/orders/my`, { headers:{'Authorization':'Bearer '+token} });
    const data = await res.json();
    if (!data.success) return rejectWithValue(data.message);
    return data.data;
  } catch { return rejectWithValue('Failed to fetch orders'); }
});

export const fetchAllOrders = createAsyncThunk('orders/fetchAll', async (token, { rejectWithValue }) => {
  try {
    const res  = await fetch(`${API}/api/orders/all`, { headers:{'Authorization':'Bearer '+token} });
    const data = await res.json();
    if (!data.success) return rejectWithValue(data.message);
    return data.data;
  } catch { return rejectWithValue('Failed to fetch all orders'); }
});

export const placeOrder = createAsyncThunk('orders/place', async ({ orderData, token }, { rejectWithValue }) => {
  try {
    const res  = await fetch(`${API}/api/orders`, { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body:JSON.stringify(orderData) });
    const data = await res.json();
    if (!data.success) return rejectWithValue(data.message);
    return data.data;
  } catch { return rejectWithValue('Failed to place order'); }
});

export const cancelOrder = createAsyncThunk('orders/cancel', async ({ id, token }, { rejectWithValue }) => {
  try {
    const res  = await fetch(`${API}/api/orders/`+id+`/cancel`, { method:'PUT', headers:{'Authorization':'Bearer '+token} });
    const data = await res.json();
    if (!data.success) return rejectWithValue(data.message);
    return id;
  } catch { return rejectWithValue('Failed to cancel order'); }
});

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, orderStatus, messageText, token }, { rejectWithValue }) => {
  try {
    const res  = await fetch(`${API}/api/orders/`+id+`/status`, { method:'PUT', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body:JSON.stringify({orderStatus,messageText}) });
    const data = await res.json();
    if (!data.success) return rejectWithValue(data.message);
    return data.data;
  } catch { return rejectWithValue('Failed to update order'); }
});

export const fetchRevenue = createAsyncThunk('orders/revenue', async (token, { rejectWithValue }) => {
  try {
    const res  = await fetch(`${API}/api/orders/admin/revenue`, { headers:{'Authorization':'Bearer '+token} });
    const data = await res.json();
    if (!data.success) return rejectWithValue(data.message);
    return data.data;
  } catch { return rejectWithValue('Failed to fetch revenue'); }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: { orders:[], allOrders:[], revenue:[], loading:false, error:'', successMsg:'' },
  reducers: {
    clearOrderMsg: s => { s.successMsg=''; s.error=''; }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchMyOrders.fulfilled,   (s,a) => { s.orders=a.payload; s.loading=false; })
      .addCase(fetchAllOrders.fulfilled,  (s,a) => { s.allOrders=a.payload; s.loading=false; })
      .addCase(placeOrder.pending,        s     => { s.loading=true; s.error=''; })
      .addCase(placeOrder.fulfilled,      (s,a) => { s.loading=false; s.orders=[a.payload,...s.orders]; s.successMsg='Order placed!'; })
      .addCase(placeOrder.rejected,       (s,a) => { s.loading=false; s.error=a.payload; })
      .addCase(cancelOrder.fulfilled,     (s,a) => { s.orders=s.orders.map(o=>o._id===a.payload?{...o,orderStatus:'cancelled'}:o); s.successMsg='Order cancelled.'; })
      .addCase(updateOrderStatus.fulfilled,(s,a) => { s.allOrders=s.allOrders.map(o=>o._id===a.payload._id?a.payload:o); s.successMsg='Status updated!'; })
      .addCase(fetchRevenue.fulfilled,    (s,a) => { s.revenue=a.payload; });
  }
});

export const { clearOrderMsg } = orderSlice.actions;
export default orderSlice.reducer;
