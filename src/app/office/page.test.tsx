### Unit Tests for AdminOfficePage

We will use Jest and React Testing Library to write unit tests for the `AdminOfficePage` component.

tsx
// src/app/office/page.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import AdminOfficePage from './page';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock('../lib/security', () => ({
  getAdminSecretPasscode: jest.fn(() => 'secret-passcode'),
}));

describe('AdminOfficePage', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockImplementation(() => ({
      push: jest.fn(),
    }));
    (useSession as jest.Mock).mockImplementation(() => ({
      data: null,
    }));
  });

  it('renders the form', () => {
    const { getByText, getByPlaceholderText } = render(<AdminOfficePage />);
    expect(getByText('Admin Office')).toBeInTheDocument();
    expect(getByText('Enter the secret passcode to access the admin office')).toBeInTheDocument();
    expect(getByPlaceholderText('Enter passcode')).toBeInTheDocument();
    expect(getByText('Submit')).toBeInTheDocument();
  });

  it('calls handlePasscodeChange when input changes', () => {
    const { getByPlaceholderText } = render(<AdminOfficePage />);
    const input = getByPlaceholderText('Enter passcode');
    const newPasscode = 'new-passcode';
    fireEvent.change(input, { target: { value: newPasscode } });
    expect(input).toHaveValue(newPasscode);
  });

  it('calls handlePasscodeSubmit when form is submitted', async () => {
    const { getByText, getByPlaceholderText } = render(<AdminOfficePage />);
    const input = getByPlaceholderText('Enter passcode');
    const submitButton = getByText('Submit');
    const newPasscode = 'secret-passcode';
    fireEvent.change(input, { target: { value: newPasscode } });
    fireEvent.submit(submitButton);
    await waitFor(() => expect(useRouter().push).toHaveBeenCalledTimes(1));
    expect(useRouter().push).toHaveBeenCalledWith('/office/dashboard');
  });

  it('displays an error message when passcode is invalid', async () => {
    const { getByText, getByPlaceholderText } = render(<AdminOfficePage />);
    const input = getByPlaceholderText('Enter passcode');
    const submitButton = getByText('Submit');
    const newPasscode = 'invalid-passcode';
    fireEvent.change(input, { target: { value: newPasscode } });
    fireEvent.submit(submitButton);
    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
    expect(toast.error).toHaveBeenCalledWith('Invalid passcode');
  });

  it('renders a message when user is already logged in as an admin', () => {
    (useSession as jest.Mock).mockImplementationOnce(() => ({
      data: { user: { role: 'admin' } },
    }));
    const { getByText } = render(<AdminOfficePage />);
    expect(getByText('You are already logged in as an admin')).toBeInTheDocument();
  });
});


These tests cover the following scenarios:

* Rendering the form
* Handling input changes
* Submitting the form with a valid passcode
* Submitting the form with an invalid passcode
* Rendering a message when the user is already logged in as an admin

Note that we use `jest.mock` to mock the `useRouter`, `useSession`, `toast`, and `getAdminSecretPasscode` functions to isolate the component's behavior. We also use `waitFor` to wait for the `useRouter().push` function to be called, as it is an asynchronous operation.