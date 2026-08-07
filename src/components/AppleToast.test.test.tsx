Here are some unit tests for the `AppleToast` component using Jest and React Testing Library:

// src/components/AppleToast.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { AppleToast } from './AppleToast';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

jest.mock('react-toastify');

describe('AppleToast component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the toast container', () => {
    const { getByTestId } = render(<AppleToast message="Test message" type="success" />);
    expect(getByTestId('toast-container')).toBeInTheDocument();
  });

  it('renders the toast message', () => {
    const { getByText } = render(<AppleToast message="Test message" type="success" />);
    expect(getByText('Test message')).toBeInTheDocument();
  });

  it('renders the toast title', () => {
    const { getByText } = render(<AppleToast message="Test message" type="success" />);
    expect(getByText('Success')).toBeInTheDocument();
  });

  it('renders the close button', () => {
    const { getByText } = render(<AppleToast message="Test message" type="success" />);
    expect(getByText('Close')).toBeInTheDocument();
  });

  it('closes the toast when the close button is clicked', () => {
    const { getByText } = render(<AppleToast message="Test message" type="success" />);
    const closeButton = getByText('Close');
    fireEvent.click(closeButton);
    expect(closeButton).not.toBeInTheDocument();
  });

  it('displays the toast for 3 seconds', async () => {
    const { getByText } = render(<AppleToast message="Test message" type="success" />);
    await waitFor(() => getByText('Test message'));
    await waitFor(() => expect(getByText('Test message')).not.toBeInTheDocument());
  });

  it('calls the toast function with the correct type', () => {
    const toastSpy = jest.spyOn(toast, 'info');
    render(<AppleToast message="Test message" type="success" />);
    expect(toastSpy).toHaveBeenCalledTimes(1);
    expect(toastSpy).toHaveBeenCalledWith('Success', 'Test message');
  });
});

Note that we're using `jest.mock('react-toastify')` to mock the `toast` function from `react-toastify`, so we can test its behavior without actually displaying the toast.

Also, we're using `waitFor` from `@testing-library/react` to wait for the toast to appear and disappear, since it's displayed for 3 seconds.

Finally, we're using `fireEvent.click` to simulate a click on the close button, and `expect` to assert that the button is no longer in the document after it's been clicked.