// Jest — menuSlice unit tests
import menuReducer, { setSelectedCategory, setSearchQuery, clearMenuError } from '../store/slices/menuSlice';

describe('menuSlice', () => {
  const initialState = { items: [], categories: [], loading: false, error: '', selectedCategory: 'All', searchQuery: '' };

  test('returns initial state', () => {
    const state = menuReducer(undefined, { type: '@@INIT' });
    expect(state.selectedCategory).toBe('All');
    expect(state.searchQuery).toBe('');
    expect(state.items).toHaveLength(0);
  });

  test('setSelectedCategory updates category', () => {
    const state = menuReducer(initialState, setSelectedCategory('Pizza'));
    expect(state.selectedCategory).toBe('Pizza');
  });

  test('setSearchQuery updates search', () => {
    const state = menuReducer(initialState, setSearchQuery('margherita'));
    expect(state.searchQuery).toBe('margherita');
  });

  test('clearMenuError resets error', () => {
    const withError = { ...initialState, error: 'Failed to load' };
    const state     = menuReducer(withError, clearMenuError());
    expect(state.error).toBe('');
  });

  test('fetchMenuItems.pending sets loading true', () => {
    const state = menuReducer(initialState, { type: 'menu/fetchItems/pending' });
    expect(state.loading).toBe(true);
  });

  test('fetchMenuItems.fulfilled loads items', () => {
    const items   = [{ _id: '1', name: 'Margherita', price: 199 }, { _id: '2', name: 'Pepperoni', price: 299 }];
    const state   = menuReducer(initialState, { type: 'menu/fetchItems/fulfilled', payload: items });
    expect(state.items).toHaveLength(2);
    expect(state.loading).toBe(false);
  });

  test('createMenuItem.fulfilled adds item to list', () => {
    const existing  = { ...initialState, items: [{ _id: '1', name: 'Margherita', price: 199 }] };
    const newItem   = { _id: '2', name: 'Farmhouse', price: 249 };
    const state     = menuReducer(existing, { type: 'menu/create/fulfilled', payload: newItem });
    expect(state.items).toHaveLength(2);
    expect(state.items[0].name).toBe('Farmhouse'); // unshift — new item first
  });

  test('deleteMenuItem.fulfilled removes item', () => {
    const withItems = { ...initialState, items: [{ _id: '1', name: 'Pizza' }, { _id: '2', name: 'Wings' }] };
    const state     = menuReducer(withItems, { type: 'menu/delete/fulfilled', payload: '1' });
    expect(state.items).toHaveLength(1);
    expect(state.items[0]._id).toBe('2');
  });

  test('updateMenuItem.fulfilled updates item in list', () => {
    const withItems = { ...initialState, items: [{ _id: '1', name: 'Pizza', price: 199 }] };
    const updated   = { _id: '1', name: 'Pizza Updated', price: 249 };
    const state     = menuReducer(withItems, { type: 'menu/update/fulfilled', payload: updated });
    expect(state.items[0].name).toBe('Pizza Updated');
    expect(state.items[0].price).toBe(249);
  });
});
