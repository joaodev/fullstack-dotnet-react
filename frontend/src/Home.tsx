import { Container, Button, Navbar, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" fixed="top" expand="lg">
        <Container>
          <Navbar.Brand href="/home">
            Sistema
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/usuarios">Usuários</Nav.Link>
              <Nav.Link href="/departamentos">Departamentos</Nav.Link>
              <Nav.Link href="/produtos">Produtos</Nav.Link>
            </Nav>
            <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    <Container className="mt-5 pt-5">
        <div className="d-flex justify-content-between">
            <div className="card text-center" style={{ width: '18rem' }}>
                <div className="card-body">
                    <h5 className="card-title">Usuários</h5>
                    <p className="card-text">Total: 1</p>
                    <Button variant="primary" href="/usuarios">Ver Usuários</Button>
                </div>
            </div>
            <div className="card text-center" style={{ width: '18rem' }}>
                <div className="card-body">
                    <h5 className="card-title">Departamentos</h5>
                    <p className="card-text">Total: 2</p>
                    <Button variant="primary" href="/departamentos">Ver Departamentos</Button>
                </div>
            </div>
            <div className="card text-center" style={{ width: '18rem' }}>
                <div className="card-body">
                    <h5 className="card-title">Produtos</h5>
                    <p className="card-text">Total: 3</p>
                    <Button variant="primary" href="/produtos">Ver Produtos</Button>
                </div>
            </div>
        </div>
    </Container>
    </>
  );
}

export default Home;
