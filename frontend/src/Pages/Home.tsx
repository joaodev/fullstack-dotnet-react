import React, { useEffect, useState } from 'react';
import { Container, Button, Navbar, Nav, Row, Col } from 'react-bootstrap';
import { FaUsers, FaBuilding, FaBoxOpen } from 'react-icons/fa';
import { fetchUsersTotal } from '../services/userService';
import { fetchDepartmentsTotal } from '../services/departmentService';
import { fetchProductsTotal } from '../services/productService';
import { useNavigate } from 'react-router-dom';


function Home() {
  const navigate = useNavigate();
  const [usersTotal, setUsersTotal] = useState<number>(0);
  const [departmentsTotal, setDepartmentsTotal] = useState<number>(0);
  const [productsTotal, setProductsTotal] = useState<number>(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    fetch('http://localhost:8080/api/home', {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
    });

    // Buscar totalizadores
    fetchUsersTotal(token)
      .then(setUsersTotal)
      .catch(() => setUsersTotal(0));
    fetchDepartmentsTotal(token)
      .then(setDepartmentsTotal)
      .catch(() => setDepartmentsTotal(0));
    fetchProductsTotal(token)
      .then(setProductsTotal)
      .catch(() => setProductsTotal(0));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" fixed="top" expand="lg">
        <Container>
          <Navbar.Brand href="/home">Sistema</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/usuarios">Usuários</Nav.Link>
              <Nav.Link href="/departamentos">Departamentos</Nav.Link>
              <Nav.Link href="/produtos">Produtos</Nav.Link>
            </Nav>
            <Button variant="outline-light" onClick={handleLogout}>
              Logout
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="mt-5 pt-5">
        <Row className="g-4 justify-content-center">
          <Col xs={12} md={4}>
            <a href="/usuarios" style={{ textDecoration: 'none' }}>
              <div className="card shadow-lg border-0 text-white text-center p-4" style={{ background: 'linear-gradient(135deg, #007bff 70%, #0056b3 100%)', minHeight: 220 }}>
                <FaUsers size={56} className="mb-3" />
                <h2 className="fw-bold">{usersTotal}</h2>
                <h5 className="mb-2">Usuários</h5>
              </div>
            </a>
          </Col>
          <Col xs={12} md={4}>
            <a href="/departamentos" style={{ textDecoration: 'none' }}>
              <div className="card shadow-lg border-0 text-white text-center p-4" style={{ background: 'linear-gradient(135deg, #28a745 70%, #218838 100%)', minHeight: 220 }}>
                <FaBuilding size={56} className="mb-3" />
                <h2 className="fw-bold">{departmentsTotal}</h2>
                <h5 className="mb-2">Departamentos</h5>
              </div>
            </a>
          </Col>
          <Col xs={12} md={4}>
            <a href="/produtos" style={{ textDecoration: 'none' }}>
              <div className="card shadow-lg border-0 text-white text-center p-4" style={{ background: 'linear-gradient(135deg, #fd7e14 70%, #e8590c 100%)', minHeight: 220 }}>
              <FaBoxOpen size={56} className="mb-3" />
              <h2 className="fw-bold">{productsTotal}</h2>
              <h5 className="mb-2">Produtos</h5>
              </div>
            </a>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Home;
