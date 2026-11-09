import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn(() => new Promise(() => {}));
});

test('sends logged-out users to the login page', async () => {
  render(<App />);
  expect(await screen.findByRole('heading', { name: /log in/i })).toBeInTheDocument();
  expect(screen.getByText('iNotebook')).toBeInTheDocument();
});

test('loads notes for logged-in users', async () => {
  localStorage.setItem('token', 'test-token');
  window.history.pushState({}, '', '/');
  render(<App />);
  expect(await screen.findByText(/loading your notes/i)).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledWith('/api/notes/fetchnotes', expect.objectContaining({ headers: { 'auth-token': 'test-token' } }));
});
