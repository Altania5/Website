import React from 'react';

const Toast = ({ toast, onRemove }) => {
  const getToastStyle = (type) => {
    const baseStyle = {
      padding: "12px 16px",
      borderRadius: "8px",
      marginBottom: "8px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      minWidth: "300px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      animation: "slideIn 0.3s ease-out",
    };

    switch (type) {
      case 'success':
        return { ...baseStyle, background: "#10b981", color: "white" };
      case 'error':
        return { ...baseStyle, background: "#ef4444", color: "white" };
      case 'warning':
        return { ...baseStyle, background: "#f59e0b", color: "white" };
      case 'info':
      default:
        return { ...baseStyle, background: "#3b82f6", color: "white" };
    }
  };

  return (
    <div style={getToastStyle(toast.type)}>
      <span>{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: "rgba(255,255,255,0.2)",
          border: "none",
          color: "white",
          borderRadius: "4px",
          padding: "4px 8px",
          cursor: "pointer",
          fontSize: "12px",
        }}
      >
        ×
      </button>
    </div>
  );
};

const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 9999,
        maxWidth: "400px",
      }}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

export default ToastContainer;

