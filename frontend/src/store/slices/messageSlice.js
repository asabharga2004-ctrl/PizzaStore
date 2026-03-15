import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchMessages = createAsyncThunk('messages/fetch', async (token, { rejectWithValue }) => {
  try {
    const res  = await fetch('/api/messages', { headers:{'Authorization':'Bearer '+token} });
    const data = await res.json();
    if (!data.success) return rejectWithValue(data.message);
    return data.data;
  } catch { return rejectWithValue('Failed to fetch messages'); }
});

export const markMessageRead = createAsyncThunk('messages/markRead', async ({ id, token }, { rejectWithValue }) => {
  try {
    await fetch('/api/messages/'+id+'/read', { method:'PUT', headers:{'Authorization':'Bearer '+token} });
    return id;
  } catch { return rejectWithValue('Failed to mark as read'); }
});

const messageSlice = createSlice({
  name: 'messages',
  initialState: { messages:[], loading:false, error:'' },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchMessages.pending,    s     => { s.loading=true; })
      .addCase(fetchMessages.fulfilled,  (s,a) => { s.loading=false; s.messages=a.payload; })
      .addCase(fetchMessages.rejected,   (s,a) => { s.loading=false; s.error=a.payload; })
      .addCase(markMessageRead.fulfilled,(s,a) => { s.messages=s.messages.map(m=>m._id===a.payload?{...m,isRead:true}:m); });
  }
});

export default messageSlice.reducer;
