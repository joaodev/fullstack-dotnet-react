import React, { ReactNode } from 'react';
import { Container } from 'react-bootstrap';
import AppNavbar from './AppNavbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <AppNavbar />
      <Container className="mt-5 pt-5">
        {children}
      </Container>
    </>
  );
};

export default Layout;
