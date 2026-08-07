**src/app/office/page.tsx**
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { AiOutlineLock, AiOutlineUnlock } from 'react-icons/ai';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from 'next-themes';
import { ThemeProvider } from 'styled-components';
import { Container, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../lib/auth';
import { useAdminOffice } from '../lib/admin-office';
import { useTwoFactor } from '../lib/two-factor';
import { useAnalytics } from '../lib/analytics';
import { useProduct } from '../lib/product';
import { useLicense } from '../lib/license';
import { useOrder } from '../lib/order';
import { useAffiliate } from '../lib/affiliate';
import { useVendor } from '../lib/vendor';
import { useCustomRequest } from '../lib/custom-request';
import { useAutoPipeline } from '../lib/auto-pipeline';
import { useDownload } from '../lib/download';
import { useSecurity } from '../lib/security';
import { useGeoCurrency } from '../lib/geo-currency';
import { useThemeVariables } from '../lib/theme-variables';
import { useToast } from '../lib/toast';

const AdminOfficePage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { theme } = useTheme();
  const { adminOffice } = useAdminOffice();
  const { twoFactor } = useTwoFactor();
  const { analytics } = useAnalytics();
  const { product } = useProduct();
  const { license } = useLicense();
  const { order } = useOrder();
  const { affiliate } = useAffiliate();
  const { vendor } = useVendor();
  const { customRequest } = useCustomRequest();
  const { autoPipeline } = useAutoPipeline();
  const { download } = useDownload();
  const { security } = useSecurity();
  const { geoCurrency } = useGeoCurrency();
  const { themeVariables } = useThemeVariables();
  const { toast } = useToast();

  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (session && session.user && session.user.adminOffice) {
      router.push('/office/dashboard');
    }
  }, [session, router]);

  const handlePasscodeSubmit = async (event) => {
    event.preventDefault();
    try {
      const isValid = await adminOffice.validatePasscode(passcode);
      if (isValid) {
        router.push('/office/dashboard');
      } else {
        setError('Invalid passcode');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handlePasscodeChange = (event) => {
    setPasscode(event.target.value);
  };

  const handleTwoFactorSubmit = async (event) => {
    event.preventDefault();
    try {
      const isValid = await twoFactor.validateCode(passcode);
      if (isValid) {
        router.push('/office/dashboard');
      } else {
        setError('Invalid two-factor code');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <ThemeProvider theme={themeVariables}>
      <Container fluid className="p-0 m-0">
        <Row className="h-100">
          <Col className="d-flex justify-content-center align-items-center h-100">
            <div className="text-center">
              <h1 className="display-1">NexaVault Admin Office</h1>
              <p className="lead">Enter your passcode to access the admin dashboard</p>
              <Button variant="primary" onClick={() => setShowPasscodeModal(true)}>
                Enter Passcode
              </Button>
              <Modal show={showPasscodeModal} onHide={() => setShowPasscodeModal(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>Enter Passcode</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form onSubmit={handlePasscodeSubmit}>
                    <Form.Group controlId="passcode">
                      <Form.Label>Passcode</Form.Label>
                      <Form.Control
                        type="password"
                        value={passcode}
                        onChange={handlePasscodeChange}
                        required
                      />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                      Submit
                    </Button>
                  </Form>
                  {error && <p className="text-danger">{error}</p>}
                </Modal.Body>
              </Modal>
              <Button variant="primary" onClick={() => setShowPasscodeModal(true)}>
                Enter Two-Factor Code
              </Button>
              <Modal show={showPasscodeModal} onHide={() => setShowPasscodeModal(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>Enter Two-Factor Code</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form onSubmit={handleTwoFactorSubmit}>
                    <Form.Group controlId="twoFactorCode">
                      <Form.Label>Two-Factor Code</Form.Label>
                      <Form.Control
                        type="password"
                        value={passcode}
                        onChange={handlePasscodeChange}
                        required
                      />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                      Submit
                    </Button>
                  </Form>
                  {error && <p className="text-danger">{error}</p>}
                </Modal.Body>
              </Modal>
            </div>
          </Col>
        </Row>
      </Container>
    </ThemeProvider>
  );
};

export default AdminOfficePage;

**src/app/office/page.styles.ts**
.page {
  background-color: #0b0f17;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.page-content {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.page-header {
  background-color: #333;
  padding: 10px;
  border-bottom: 1px solid #ccc;
}

.page-header h1 {
  color: #fff;
  font-size: 24px;
}

.page-header p {
  color: #ccc;
  font-size: 16px;
}

.passcode-modal {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.passcode-modal form {
  padding: 20px;
}

.passcode-modal form label {
  display: block;
  margin-bottom: 10px;
}

.passcode-modal form input {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.passcode-modal form button {
  background-color: #333;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.passcode-modal form button:hover {
  background-color: #444;
}

.passcode-modal form button:active {
  background-color: #555;
}

.passcode-modal form p {
  color: #ccc;
  font-size: 16px;
  margin-bottom: 20px;
}

**src/app/office/page.test.tsx**
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { AdminOfficePage } from './page';

describe('AdminOfficePage', () => {
  it('renders passcode modal', () => {
    const { getByText } = render(<AdminOfficePage />);
    expect(getByText('Enter Passcode')).toBeInTheDocument();
  });

  it('renders two-factor modal', () => {
    const { getByText } = render(<AdminOfficePage />);
    expect(getByText('Enter Two-Factor Code')).toBeInTheDocument();
  });

  it('submits passcode and redirects to dashboard', async () => {
    const { getByText, getByPlaceholderText } = render(<AdminOfficePage />);
    const passcodeInput = getByPlaceholderText('Passcode');
    const submitButton = getByText('Submit');
    fireEvent.change(passcodeInput, { target: { value: '123456' } });
    fireEvent.click(submitButton);
    await waitFor(() => expect(getByText('Dashboard')).toBeInTheDocument());
  });

  it('submits two-factor code and redirects to dashboard', async () => {
    const { getByText, getByPlaceholderText } = render(<AdminOfficePage />);
    const twoFactorInput = getByPlaceholderText('Two-Factor Code');
    const submitButton = getByText('Submit');
    fireEvent.change(twoFactorInput, { target: { value: '123456' } });
    fireEvent.click(submitButton);
    await waitFor(() => expect(getByText('Dashboard')).toBeInTheDocument());
  });
});