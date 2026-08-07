**src/components/AppleToast.tsx**
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AppleToastProps {
  message: string;
  type: 'success' | 'error' | 'warning';
}

const AppleToast = ({ message, type }: AppleToastProps) => {
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setShowToast(true);
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ToastContainer
      position="bottom-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    >
      {showToast && (
        <div className="bg-white/10 rounded-lg p-4 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold">{type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Warning'}</div>
            <button
              className="text-sm hover:text-white/50 transition-all duration-200"
              onClick={() => setShowToast(false)}
            >
              Close
            </button>
          </div>
          <div className="text-sm text-white/50">{message}</div>
        </div>
      )}
    </ToastContainer>
  );
};

export default AppleToast;

**src/components/AppleToast.module.css**
.toast-container {
  @apply fixed bottom-0 right-0;
  @apply z-50;
}

.toast {
  @apply rounded-lg;
  @apply p-4;
  @apply text-white;
  @apply shadow-md;
  @apply bg-white/10;
  @apply transition-all;
  @apply duration-200;
}

.toast .toast-header {
  @apply flex;
  @apply items-center;
  @apply justify-between;
}

.toast .toast-header .toast-title {
  @apply text-sm;
  @apply font-bold;
}

.toast .toast-header .close-button {
  @apply text-sm;
  @apply hover:text-white/50;
  @apply transition-all;
  @apply duration-200;
}

.toast .toast-body {
  @apply text-sm;
  @apply text-white/50;
}

**src/components/AppleToast.styles.ts**
import { styled } from 'styled-components';

export const ToastContainer = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 50;
`;

export const Toast = styled.div`
  border-radius: 8px;
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
`;

export const ToastHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ToastTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
`;

export const CloseButton = styled.button`
  font-size: 14px;
  color: #fff;
  transition: color 0.2s ease-in-out;
  &:hover {
    color: #fff50;
  }
`;

export const ToastBody = styled.div`
  font-size: 14px;
  color: #fff50;
`;