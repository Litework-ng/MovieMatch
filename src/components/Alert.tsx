import React from 'react';

interface AlertProps {
  message: string;
  onDismiss: () => void;
  onLogin: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, onDismiss, onLogin }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        minWidth: 300,
        textAlign: 'center'
      }}>
        <p style={{ marginBottom: 20, color:'#000' }}>{message}</p>
        <button onClick={onLogin} style={{ marginRight: 10, padding: '0.5rem 1rem', borderRadius: 5, background: '#4B0082', color: 'white', border: 'none' }}>Go to Login</button>
        <button onClick={onDismiss} style={{ padding: '0.5rem 1rem', borderRadius: 5, background: '#ccc', border: 'none' }}>Dismiss</button>
      </div>
    </div>
  );
};

export default Alert;
