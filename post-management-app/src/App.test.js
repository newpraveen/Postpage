import { render, screen } from '@testing-library/react';
import App from './App';

test('renders welcome message', () => {
  // Render the App component
  render(<App />);

  // Use a testing library assertion to check if a certain text is present in the component
  const welcomeMessage = screen.getByText(/Welcome to My Post Management App/i);

  // Assert that the welcome message is found in the rendered component
  expect(welcomeMessage).toBeInTheDocument();
});
