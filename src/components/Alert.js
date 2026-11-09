import React from 'react';

// Floating alert. `alert` is { type: 'success' | 'danger' | 'info', msg } or null.
export const Alert = ({ alert }) => {
  if (!alert) return null;
  const icon = alert.type === 'success' ? 'bi-check-circle-fill' : alert.type === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill';
  return (
    <div className={`alert alert-${alert.type} d-flex align-items-center gap-2 nb-toast`} role="alert">
      <i className={`bi ${icon}`} aria-hidden="true"></i>
      <span>{alert.msg}</span>
    </div>
  );
};
