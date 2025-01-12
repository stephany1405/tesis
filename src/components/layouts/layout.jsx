import React from 'react';
import Header from '../inicio/header.jsx';

const Layout = ({ children }) => {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
};

export default Layout;