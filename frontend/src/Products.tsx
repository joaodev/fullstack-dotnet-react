import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Navbar, Nav } from 'react-bootstrap';
import ProductsDataTable from './ProductsDataTable';
import { useNavigate } from 'react-router-dom';

function Products() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ code: '', description: '', price: '', departmentId: '' });
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    // Buscar departamentos ao abrir modal
    if (showModal) {
      const token = localStorage.getItem('token');
      fetch('http://localhost:8080/api/departamentos', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setDepartments(Array.isArray(data) ? data : []);
        })
        .catch(() => setDepartments([]));
    }
  }, [showModal]);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
  setForm({ code: '', description: '', price: '', departmentId: '' });
    setAlert(null);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target.name === 'price') {
      let value = e.target.value.replace(/\D/g, ''); // Apenas dígitos
      if (value.length === 0) {
        setForm({ ...form, price: '' });
        return;
      }
      // Garante pelo menos dois dígitos para centavos
      while (value.length < 3) {
        value = '0' + value;
      }
      // Separa centavos
      const cents = value.slice(-2);
      let intPart = value.slice(0, -2);
      // Remove zeros à esquerda do inteiro, mas mantém um zero se for menor que 1 real
      intPart = intPart.replace(/^0+(?!$)/, '');
      if (intPart === '') intPart = '0';
      // Adiciona pontos de milhar
      intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      const masked = intPart + ',' + cents;
      setForm({ ...form, price: masked });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    const token = localStorage.getItem('token');
    try {
      // Reverter máscara para número
      let priceValue = form.price.replace(/\./g, ''); // remove pontos
      priceValue = priceValue.replace(/,/g, '.'); // troca vírgula por ponto
      const priceNumber = Number(priceValue);
      const response = await fetch('http://localhost:8080/api/produtos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code: form.code,
          description: form.description,
          price: priceNumber,
          departmentId: form.departmentId
        })
      });
      const result = await response.json();
      if (!response.ok) {
        let errorMsg = 'Erro ao cadastrar produto';
        if (result && result.error) {
          errorMsg = result.error;
        } else if (result && result.errors) {
          errorMsg = Object.values(result.errors).flat().join(' | ');
        } else if (result && result.message) {
          errorMsg = result.message;
        }
        setAlert({ type: 'danger', message: errorMsg });
        return;
      }
      setAlert({ type: 'success', message: 'Produto cadastrado com sucesso!' });
      setTimeout(() => {
        handleCloseModal();
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : err?.message || 'Erro desconhecido';
      setAlert({ type: 'danger', message: msg });
    }
  };
  const [produtos, setProdutos] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8080/api/produtos', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data?.error) {
          setError(data.error);
        } else if (data) {
          setProdutos(data);
        }
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <>
      {error && <div className="alert alert-danger mt-5">{error}</div>}
      <Button variant="primary" className="mb-3" onClick={handleOpenModal}>Cadastrar Produto</Button>
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
                <Card.Title>Produtos</Card.Title>
                <ProductsDataTable data={produtos} />
                {/* Modal de cadastro */}
                <div className={`modal ${showModal ? 'd-block' : ''}`} tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Cadastrar Produto</h5>
                        <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                      </div>
                      <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                          {alert && <div className={`alert alert-${alert.type}`}>{alert.message}</div>}
                          <div className="mb-3">
                            <label className="form-label">Código</label>
                            <input type="text" className="form-control" name="code" value={form.code} onChange={handleChange} required />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Nome</label>
                            <input type="text" className="form-control" name="description" value={form.description} onChange={handleChange} required />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Preço</label>
                            <input type="text" className="form-control" name="price" value={form.price} onChange={handleChange} required />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Departamento</label>
                            <select className="form-select" name="departmentId" value={form.departmentId} onChange={handleChange} required>
                              <option value="">Selecione...</option>
                              {departments.map(dep => (
                                <option key={dep.id} value={dep.id}>{dep.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                          <button type="submit" className="btn btn-primary">Cadastrar</button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Products;
