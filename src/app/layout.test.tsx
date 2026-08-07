### Unit Tests for Layout Component

We will use Jest and React Testing Library to write unit tests for the `Layout` component.

tsx
// src/app/layout.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Layout } from './layout';

describe('Layout component', () => {
  it('renders children', () => {
    const children = <div>Test children</div>;
    const { getByText } = render(<Layout>{children}</Layout>);
    expect(getByText('Test children')).toBeInTheDocument();
  });

  it('renders Header component', () => {
    const { getByRole } = render(<Layout />);
    expect(getByRole('banner')).toBeInTheDocument();
  });

  it('renders Footer component', () => {
    const { getByRole } = render(<Layout />);
    expect(getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders ToastContainer component', () => {
    const { getByTestId } = render(<Layout />);
    expect(getByTestId('toast-container')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<Layout />);
    expect(container).toMatchSnapshot();
  });
});


### Explanation of Tests

1. **renders children**: This test checks if the `Layout` component renders the provided children.
2. **renders Header component**: This test checks if the `Layout` component renders the `Header` component.
3. **renders Footer component**: This test checks if the `Layout` component renders the `Footer` component.
4. **renders ToastContainer component**: This test checks if the `Layout` component renders the `ToastContainer` component.
5. **matches snapshot**: This test checks if the `Layout` component matches the expected snapshot.

### Notes

* Make sure to install the required dependencies, including `@testing-library/react` and `jest`.
* Update the `jest.config.js` file to include the necessary configurations for testing.
* Run the tests using the `jest` command.
* Make sure to update the `layout.tsx` file to include a `data-testid` attribute on the `ToastContainer` component for the test to work. 

tsx
// src/app/layout.tsx
import type { ReactNode } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ToastContainer } from '../components/AppleToast';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ToastContainer data-testid="toast-container" />
    </div>
  );
}