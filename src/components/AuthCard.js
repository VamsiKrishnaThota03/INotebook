import React from 'react';

const AuthCard = ({ title, subtitle, children }) => (
  <div className="d-flex justify-content-center py-4 py-md-5">
    <div className="nb-card nb-auth w-100 p-4 p-sm-5">
      <h1 className="h3 fw-bold mb-1">{title}</h1>
      <p className="text-body-secondary mb-4">{subtitle}</p>
      {children}
    </div>
  </div>
);

export default AuthCard;
