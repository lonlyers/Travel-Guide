import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './store/authContext';
import App from './App';

test('renders app title', () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
  const titleElement = screen.getByText(/旅游打卡攻略/i);
  expect(titleElement).toBeInTheDocument();
});
