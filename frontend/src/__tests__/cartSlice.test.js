
import cartReducer, { clearCartMsg, resetCart } from '../store/slices/cartSlice';

describe('cartSlice', () => {
  const initialState = { items: [], totalAmount: 0, loading: false, error: '', successMsg: '' };

  test('returns initial state', () => {
    expect(cartReducer(undefined, { type: '@@INIT' })).toMatchObject({ items: [], totalAmount: 0 });
  });

  test('resetCart clears items and totalAmount', () => {
    const withItems = { ...initialState, items: [{ itemId: '1', name: 'Pizza', price: 199, quantity: 2 }], totalAmount: 398 };
    const state     = cartReducer(withItems, resetCart());
    expect(state.items).toHaveLength(0);
    expect(state.totalAmount).toBe(0);
  });

  test('clearCartMsg resets messages', () => {
    const withMsg = { ...initialState, successMsg: 'Added to cart!', error: 'some error' };
    const state   = cartReducer(withMsg, clearCartMsg());
    expect(state.successMsg).toBe('');
    expect(state.error).toBe('');
  });

  test('addToCart.pending sets loading true', () => {
    const state = cartReducer(initialState, { type: 'cart/add/pending' });
    expect(state.loading).toBe(true);
  });

  test('addToCart.fulfilled updates items and shows successMsg', () => {
    const payload = { items: [{ itemId: '1', name: 'Margherita', price: 199, quantity: 1 }], totalAmount: 199 };
    const state   = cartReducer(initialState, { type: 'cart/add/fulfilled', payload });
    expect(state.items).toHaveLength(1);
    expect(state.totalAmount).toBe(199);
    expect(state.successMsg).toBe('Added to cart!');
    expect(state.loading).toBe(false);
  });

  test('addToCart.rejected sets error', () => {
    const state = cartReducer(initialState, { type: 'cart/add/rejected', payload: 'Item not found.' });
    expect(state.error).toBe('Item not found.');
    expect(state.loading).toBe(false);
  });

  test('fetchCart.fulfilled loads cart data', () => {
    const payload = { items: [{ itemId: '2', name: 'Wings', price: 149, quantity: 2 }], totalAmount: 298 };
    const state   = cartReducer(initialState, { type: 'cart/fetch/fulfilled', payload });
    expect(state.items).toHaveLength(1);
    expect(state.totalAmount).toBe(298);
  });

  test('updateCartItem.fulfilled updates items', () => {
    const payload = { items: [{ itemId: '1', name: 'Pizza', price: 199, quantity: 3 }], totalAmount: 597 };
    const state   = cartReducer(initialState, { type: 'cart/update/fulfilled', payload });
    expect(state.items[0].quantity).toBe(3);
    expect(state.totalAmount).toBe(597);
  });
});
