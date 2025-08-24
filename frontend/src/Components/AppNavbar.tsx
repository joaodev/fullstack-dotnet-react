import React from 'react';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiLogOut, FiSettings, FiUserCheck } from 'react-icons/fi';

const AppNavbar: React.FC = () => {
  // Busca nome do usuário logado
  let userName = 'Usuário';
  const userDataStr = localStorage.getItem('userData');
  if (userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);
      if (userData?.name) userName = userData.name;
    } catch {}
  } else {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decodifica JWT (assume formato base64)
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload?.name) userName = payload.name;
      } catch {}
    }
  }
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleProfile = () => {
    navigate('/perfil');
  };

  return (
    <Navbar bg="primary" variant="dark" fixed="top" expand="lg">
      <Container>
        <Navbar.Brand href="/home">Sistema</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/home" active={location.pathname.startsWith('/home')}>Home</Nav.Link>
            <Nav.Link href="/perfil" active={location.pathname.startsWith('/perfil')}>Perfil</Nav.Link>
            <Nav.Link href="/usuarios" active={location.pathname.startsWith('/usuarios')}>Usuários</Nav.Link>
            <Nav.Link href="/departamentos" active={location.pathname.startsWith('/departamentos')}>Departamentos</Nav.Link>
            <Nav.Link href="/produtos" active={location.pathname.startsWith('/produtos')}>Produtos</Nav.Link>
          </Nav>
          <Button className='btn-sm border-0' variant="outline-light" onClick={handleProfile}>
            <span className="me-1">
              <FiUserCheck size={16} style={{ position: 'relative', top: '-2px' }} />
            </span>
            {userName}
          </Button>
          <Button className='btn-sm border-0' variant="outline-light" onClick={handleLogout}>
            <span className="me-1">
              <FiLogOut size={16} style={{ position: 'relative', top: '-2px' }} />
            </span>
            Sair
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
