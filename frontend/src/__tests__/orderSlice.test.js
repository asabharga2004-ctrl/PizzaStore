
import orderReducer, { clearOrderMsg } from '../store/slices/orderSlice';

describe('orderSlice', () => {
  const initialState = { orders: [], allOrders: [], revenue: [], loading: false, error: '', successMsg: '' };

  test('returns initial state', () => {
    const state = orderReducer(undefined, { type: '@@INIT' });
    expect(state.orders).toHaveLength(0);
    expect(state.allOrders).toHaveLength(0);
  });

  test('clearOrderMsg resets messages', () => {
    const withMsg = { ...initialState, successMsg: 'Order placed!', error: 'some error' };
    const state   = orderReducer(withMsg, clearOrderMsg());
    expect(state.successMsg).toBe('');
    expect(state.error).toBe('');
  });

  test('placeOrder.pending sets loading true', () => {
    const state = orderReducer(initialState, { type: 'orders/place/pending' });
    expect(state.loading).toBe(true);
  });

  test('placeOrder.fulfilled adds order and sets successMsg', () => {
    const newOrder = { _id: 'ord1', totalAmount: 399, orderStatus: 'pending' };
    const state    = orderReducer(initialState, { type: 'orders/place/fulfilled', payload: newOrder });
    expect(state.orders).toHaveLength(1);
    expect(state.successMsg).toBe('Order placed!');
    expect(state.loading).toBe(false);
  });

  test('placeOrder.rejected sets error', () => {
    const state = orderReducer(initialState, { type: 'orders/place/rejected', payload: 'Cart is empty.' });
    expect(state.error).toBe('Cart is empty.');
    expect(state.loading).toBe(false);
  });

  test('cancelOrder.fulfilled updates order status', () => {
    const withOrders = { ...initialState, orders: [{ _id: 'ord1', orderStatus: 'pending' }] };
    const state      = orderReducer(withOrders, { type: 'orders/cancel/fulfilled', payload: 'ord1' });
    expect(state.orders[0].orderStatus).toBe('cancelled');
  });

  test('fetchMyOrders.fulfilled loads orders', () => {
    const orders = [{ _id: '1', orderStatus: 'pending' }, { _id: '2', orderStatus: 'delivered' }];
    const state  = orderReducer(initialState, { type: 'orders/fetchMy/fulfilled', payload: orders });
    expect(state.orders).toHaveLength(2);
  });

  test('updateOrderStatus.fulfilled updates order in allOrders', () => {
    const withOrders = { ...initialState, allOrders: [{ _id: 'ord1', orderStatus: 'pending' }] };
    const updated    = { _id: 'ord1', orderStatus: 'accepted' };
    const state      = orderReducer(withOrders, { type: 'orders/updateStatus/fulfilled', payload: updated });
    expect(state.allOrders[0].orderStatus).toBe('accepted');
  });

  test('fetchRevenue.fulfilled loads revenue', () => {
    const revenue = [{ _id: { year: 2025, month: 3 }, total: 5000, count: 10 }];
    const state   = orderReducer(initialState, { type: 'orders/revenue/fulfilled', payload: revenue });
    expect(state.revenue).toHaveLength(1);
    expect(state.revenue[0].total).toBe(5000);
  });
});
