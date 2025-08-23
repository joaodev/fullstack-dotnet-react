import React from 'react';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

const AppNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <Navbar bg="primary" variant="dark" fixed="top" expand="lg">
      <Container>
        <Navbar.Brand href="/home">Sistema</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/home" active={location.pathname.startsWith('/home')}>Home</Nav.Link>
            <Nav.Link href="/usuarios" active={location.pathname.startsWith('/usuarios')}>Usuários</Nav.Link>
            <Nav.Link href="/departamentos" active={location.pathname.startsWith('/departamentos')}>Departamentos</Nav.Link>
            <Nav.Link href="/produtos" active={location.pathname.startsWith('/produtos')}>Produtos</Nav.Link>
          </Nav>
          <Button className='btn-sm' variant="outline-light" onClick={handleLogout}>
            Sair
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
