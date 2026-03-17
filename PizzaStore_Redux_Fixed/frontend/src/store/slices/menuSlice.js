import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api';

export const fetchCategories = createAsyncThunk('menu/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const res  = await fetch(`${API}/api/categories`);
    const data = await res.json();
    if (!data.success) return rejectWithValue(data.message);
    return data.data;
  } catch { return rejectWithValue('Failed to fetch categories'); }
});

export const fetchMenuItems = createAsyncThunk('menu/fetchItems', async (params = {}, { rejectWithValue }) => {
  try {
    let url = `${API}/api/menu`;
    const q = new URLSearchParams();
    if (params.category) q.set('category', params.category);
    if (params.search)   q.set('search',   params.search);
    if (q.toString())    url += '?' + q.toString();
    const res  = await fetch(url);
    const data = await res.json();
    if (!data.success) return rejectWithValue(data.message);
    return data.data;
  } catch { return rejectWithValue('Failed to fetch menu'); }
});

export const createMenuItem = createAsyncThunk('menu/create', async ({ formData, token }, { rejectWithValue }) => {
  try {
    const res  = await fetch(`${API}/api/menu`, { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body:JSON.stringify(formData) });
    const data = await res.json();
    if (!data.success) return rejectWithValue(data.message);
    return data.data;
  } catch { return rejectWithValue('Failed to create item'); }
});

export const updateMenuItem = createAsyncThunk('menu/update', async ({ id, formData, token }, { rejectWithValue }) => {
  try {
    const res  = await fetch(`${API}/api/menu/`+id, { method:'PUT', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body:JSON.stringify(formData) });
    const data = await res.json();
    if (!data.success) return rejectWithValue(data.message);
    return data.data;
  } catch { return rejectWithValue('Failed to update item'); }
});

export const deleteMenuItem = createAsyncThunk('menu/delete', async ({ id, token }, { rejectWithValue }) => {
  try {
    const res  = await fetch(`${API}/api/menu/`+id, { method:'DELETE', headers:{'Authorization':'Bearer '+token} });
    const data = await res.json();
    if (!data.success) return rejectWithValue(data.message);
    return id;
  } catch { return rejectWithValue('Failed to delete item'); }
});

const menuSlice = createSlice({
  name: 'menu',
  initialState: { items:[], categories:[], loading:false, error:'', selectedCategory:'All', searchQuery:'' },
  reducers: {
    setSelectedCategory: (s,a) => { s.selectedCategory = a.payload; },
    setSearchQuery:      (s,a) => { s.searchQuery      = a.payload; },
    clearMenuError:      (s)   => { s.error = ''; }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCategories.fulfilled, (s,a) => { s.categories = a.payload; })
      .addCase(fetchMenuItems.pending,    s     => { s.loading=true; s.error=''; })
      .addCase(fetchMenuItems.fulfilled,  (s,a) => { s.loading=false; s.items=a.payload; })
      .addCase(fetchMenuItems.rejected,   (s,a) => { s.loading=false; s.error=a.payload; })
      .addCase(createMenuItem.fulfilled,  (s,a) => { s.items.unshift(a.payload); })
      .addCase(updateMenuItem.fulfilled,  (s,a) => { s.items=s.items.map(i=>i._id===a.payload._id?a.payload:i); })
      .addCase(deleteMenuItem.fulfilled,  (s,a) => { s.items=s.items.filter(i=>i._id!==a.payload); });
  }
});

export const { setSelectedCategory, setSearchQuery, clearMenuError } = menuSlice.actions;
export default menuSlice.reducer;
