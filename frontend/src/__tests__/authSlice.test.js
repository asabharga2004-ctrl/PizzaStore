// Jest — Redux slice unit tests
import authReducer, { logout, clearError } from '../store/slices/authSlice';

describe('authSlice', () => {
  const initialState = { user: null, token: '', loading: false, error: '' };

  test('returns initial state', () => {
    expect(authReducer(undefined, { type: '@@INIT' })).toMatchObject({ user: null, loading: false, error: '' });
  });

  test('logout clears user and token', () => {
    const loggedIn = { user: { name: 'Alice', role: 'customer' }, token: 'abc123', loading: false, error: '' };
    const state    = authReducer(loggedIn, logout());
    expect(state.user).toBeNull();
    expect(state.token).toBe('');
  });

  test('clearError resets error', () => {
    const withError = { ...initialState, error: 'Invalid credentials' };
    const state     = authReducer(withError, clearError());
    expect(state.error).toBe('');
  });

  test('loginUser.pending sets loading true', () => {
    const state = authReducer(initialState, { type: 'auth/login/pending' });
    expect(state.loading).toBe(true);
    expect(state.error).toBe('');
  });

  test('loginUser.fulfilled sets user and token', () => {
    const user    = { id: '1', name: 'Alice', role: 'customer' };
    const payload = { user, token: 'token123' };
    const state   = authReducer(initialState, { type: 'auth/login/fulfilled', payload });
    expect(state.user).toEqual(user);
    expect(state.token).toBe('token123');
    expect(state.loading).toBe(false);
  });

  test('loginUser.rejected sets error', () => {
    const state = authReducer(initialState, { type: 'auth/login/rejected', payload: 'Invalid email or password.' });
    expect(state.error).toBe('Invalid email or password.');
    expect(state.loading).toBe(false);
  });

  test('registerUser.fulfilled sets user and token', () => {
    const user    = { id: '2', name: 'Bob', role: 'customer' };
    const payload = { user, token: 'newtoken' };
    const state   = authReducer(initialState, { type: 'auth/register/fulfilled', payload });
    expect(state.user).toEqual(user);
    expect(state.token).toBe('newtoken');
  });
});
