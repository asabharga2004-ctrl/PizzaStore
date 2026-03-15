import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const res  = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(credentials) });
    const data = await res.json();
    if (!data.success) return rejectWithValue(data.message);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user',  JSON.stringify(data.user));
    return data;
  } catch { return rejectWithValue('Server error. Is backend running?'); }
});

export const registerUser = createAsyncThunk('auth/register', async (formData, { rejectWithValue }) => {
  try {
    const res  = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(formData) });
    const data = await res.json();
    if (!data.success) return rejectWithValue(data.message);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user',  JSON.stringify(data.user));
    return data;
  } catch { return rejectWithValue('Server error. Is backend running?'); }
});

const storedUser  = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:    storedUser  ? JSON.parse(storedUser) : null,
    token:   storedToken || '',
    loading: false,
    error:   ''
  },
  reducers: {
    logout(state) {
      state.user  = null;
      state.token = '';
      state.error = '';
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError(state) { state.error = ''; }
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending,    s => { s.loading=true;  s.error=''; })
      .addCase(loginUser.fulfilled,  (s,a) => { s.loading=false; s.user=a.payload.user; s.token=a.payload.token; })
      .addCase(loginUser.rejected,   (s,a) => { s.loading=false; s.error=a.payload; })
      .addCase(registerUser.pending,   s => { s.loading=true;  s.error=''; })
      .addCase(registerUser.fulfilled, (s,a) => { s.loading=false; s.user=a.payload.user; s.token=a.payload.token; })
      .addCase(registerUser.rejected,  (s,a) => { s.loading=false; s.error=a.payload; });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
