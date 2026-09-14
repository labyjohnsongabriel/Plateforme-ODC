import { Toaster } from 'react-hot-toast';

export function ToastContainer() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--odc-surface)',
          color: 'var(--odc-text-primary)',
          border: '1px solid var(--odc-border)',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          boxShadow: '0 10px 25px rgba(255, 121, 0, 0.12)',
          maxWidth: '400px',
        },
        success: {
          iconTheme: {
            primary: '#2E7D32',
            secondary: '#FFFFFF',
          },
        },
        error: {
          iconTheme: {
            primary: '#C62828',
            secondary: '#FFFFFF',
          },
        },
        loading: {
          iconTheme: {
            primary: '#FF7900',
            secondary: '#FFFFFF',
          },
        },
      }}
    />
  );
}

// Helpers
export { default as toast } from 'react-hot-toast';