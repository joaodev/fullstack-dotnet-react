import React, { useEffect, useState } from 'react';
import { Container, Button, Navbar, Nav, Table, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Departments() {
  const [departamentos, setDepartamentos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8080/api/departamentos', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setDepartamentos(data));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" fixed="top" expand="lg">
        <Container>
          <Navbar.Brand href="/home">
            Controle de Produtos
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
      <Container>
        <Row className="justify-content-md-center">
          <Col md={12}>
            <Card className="mt-4">
              <Card.Body>
                <Card.Title>Departamentos</Card.Title>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departamentos.map((d: any) => (
                      <tr key={d.id}>
                        <td>{d.id}</td>
                        <td>{d.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Departments;
