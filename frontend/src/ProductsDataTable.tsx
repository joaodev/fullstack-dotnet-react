import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Form, Row, Col } from 'react-bootstrap';

interface Product {
  id: string;
  code: string;
  description: string;
  price: number;
  departmentId?: string;
}

interface ProductsDataTableProps {
  data: Product[];
}

const columns: TableColumn<Product>[] = [
  {
    name: 'Código',
    selector: (row) => row.code,
    sortable: true,
  },
  {
    name: 'Nome',
    selector: (row) => row.description,
    sortable: true,
  },
  {
    name: 'Departamento',
    selector: (row) => row.departmentId || '',
    sortable: true,
  },
  {
    name: 'Preço',
    selector: (row) => row.price,
    sortable: true,
    right: true,
    cell: (row) =>
      Number(row.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
  },
];

const ProductsDataTable: React.FC<ProductsDataTableProps> = ({ data }) => {
  const exportToCSV = () => {
    const csvRows = [];
    const headers = ['Código', 'Nome', 'Departamento', 'Preço'];
    csvRows.push(headers.join(','));
    filteredData.forEach((item: Product) => {
      csvRows.push(
        [
          item.code,
          item.description,
          item.departmentId || '',
          Number(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        ].join(','),
      );
    });
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'produtos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const [filterText, setFilterText] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filteredData, setFilteredData] = useState<Product[]>(data);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; message: string } | null>(
    null,
  );
  const [editMode, setEditMode] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [deleting, setDeleting] = useState(false); // Adicione este estado
  const [price, setPrice] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
    useEffect(() => {
      // Buscar departamentos ao abrir modal
      if (showModal) {
        const token = localStorage.getItem('token');
        fetch('http://localhost:8080/api/departamentos', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            setDepartments(Array.isArray(data) ? data : []);
          })
          .catch(() => setDepartments([]));
      }
    }, [showModal]);

  useEffect(() => {
    // Buscar departamentos na API
    fetch('/api/departments')
      .then((res) => res.json())
      .then((data) => setDepartments(data));
  }, []);

  const handleEditClick = () => {
    if (!selectedProduct) return;
    setEditDescription(selectedProduct.description);
    setPrice(String(selectedProduct.price)); // Preenche o preço atual
    setDepartmentId(selectedProduct.departmentId || ''); // Preenche o departamento atual
    setEditMode(true);
    setFeedback(null);
  };

  const handleEditSave = async () => {
    if (!selectedProduct) return;
    if (!editDescription || editDescription === selectedProduct.description) return;
    setLoading(true);
    setFeedback(null);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8080/api/produtos/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...selectedProduct, description: editDescription }),
      });
      if (!response.ok) {
        setFeedback({ type: 'danger', message: 'Erro ao editar produto' });
        setLoading(false);
        return;
      }
      setFilteredData((prev) =>
        prev.map((prod) =>
          prod.id === selectedProduct.id ? { ...prod, description: editDescription } : prod,
        ),
      );
      setFeedback({ type: 'success', message: 'Produto editado com sucesso!' });
      setLoading(false);
      setTimeout(() => {
        setShowModal(false);
        setSelectedProduct(null);
        setFeedback(null);
        setEditMode(false);
      }, 3000);
    } catch (err) {
      setFeedback({ type: 'danger', message: 'Erro ao editar produto' });
      setLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditMode(false);
    setFeedback(null);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    setDeleting(true); // Ativa o estado de exclusão
    setLoading(true);
    setFeedback(null);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8080/api/produtos/${selectedProduct.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        setFeedback({ type: 'danger', message: 'Erro ao excluir produto' });
        setLoading(false);
        setDeleting(false); // Desativa o estado de exclusão
        return;
      }
      setFilteredData((prev) => prev.filter((prod) => prod.id !== selectedProduct.id));
      setFeedback({ type: 'success', message: 'Produto excluído com sucesso!' });
      setLoading(false);
      setTimeout(() => {
        setShowModal(false);
        setSelectedProduct(null);
        setFeedback(null);
        setDeleting(false); // Desativa o estado de exclusão
      }, 3000);
    } catch (err) {
      setFeedback({ type: 'danger', message: 'Erro ao excluir produto' });
      setLoading(false);
      setDeleting(false); // Desativa o estado de exclusão
    }
  };

  const handleRowClicked = (row: Product) => {
    setSelectedProduct(row);
    setShowModal(true);
    setEditMode(false);
    setFeedback(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setEditMode(false);
    setFeedback(null);
    setDeleting(false); // Reseta o estado ao fechar
  };

  useEffect(() => {
    setFilteredData(
      data.filter((item: Product) => {
        const matchesText =
          item.description.toLowerCase().includes(filterText.toLowerCase()) ||
          item.code.toLowerCase().includes(filterText.toLowerCase());
        const price = Number(item.price);
        const min = minPrice ? Number(minPrice) : undefined;
        const max = maxPrice ? Number(maxPrice) : undefined;
        const matchesMin = min === undefined || price >= min;
        const matchesMax = max === undefined || price <= max;
        const matchesDept =
          !departmentFilter || String(item.departmentId) === String(departmentFilter);
        return matchesText && matchesMin && matchesMax && matchesDept;
      }),
    );
  }, [filterText, minPrice, maxPrice, departmentFilter, data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setLoading(true);
    const updatedProduct: Product = {
      id: selectedProduct.id,
      code: selectedProduct.code,
      description: editDescription || selectedProduct.description,
      price: Number(price) || selectedProduct.price,
      departmentId: departmentId || selectedProduct.departmentId,
    };
    // Enviar para API
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:8080/api/produtos/${selectedProduct.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedProduct),
    });
    setFilteredData((prev) =>
      prev.map((prod) => (prod.id === selectedProduct.id ? updatedProduct : prod)),
    );
    setFeedback({ type: 'success', message: 'Produto atualizado com sucesso!' });
    setLoading(false);
    setTimeout(() => {
      setShowModal(false);
      setSelectedProduct(null);
      setFeedback(null);
      setEditMode(false);
    }, 3000);
  };

  return (
    <>
      <Row className="mb-3">
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Buscar por nome ou código..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </Col>
        <Col md={2}>
          <Form.Control
            type="number"
            placeholder="Preço mínimo"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </Col>
        <Col md={2}>
          <Form.Control
            type="number"
            placeholder="Preço máximo"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">Todos os Departamentos</option>
            {[
              ...new Set(
                data.map((item: Product) => item.departmentId).filter((n): n is string => !!n),
              ),
            ].map((deptId) => (
              <option key={deptId} value={deptId}>
                {deptId}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={2}>
          <button className="btn btn-success w-100" onClick={exportToCSV}>
            Exportar CSV
          </button>
        </Col>
      </Row>
      <DataTable
        title="Produtos"
        columns={columns}
        data={filteredData}
        pagination
        highlightOnHover
        striped
        responsive
        onRowClicked={handleRowClicked}
      />

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Editar Produto' : 'Detalhes do Produto'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {feedback && (
            <div
              className={`alert alert-${feedback.type} text-center py-3 fs-4`}
              style={{ fontWeight: 'bold' }}
            >
              {feedback.message}
            </div>
          )}
          {selectedProduct && !editMode && (
            <>
              <p>
                <strong>Código:</strong> {selectedProduct.code}
              </p>
              <p>
                <strong>Nome:</strong> {selectedProduct.description}
              </p>
              <p>
                <strong>Departamento:</strong> {selectedProduct.departmentId}
              </p>
              <p>
                <strong>Preço:</strong>{' '}
                {Number(selectedProduct.price).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </p>
            </>
          )}
          {selectedProduct && editMode && (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nome</Form.Label>
                <Form.Control
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Preço</Form.Label>
                <Form.Control
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={loading}
                  required
                  step="0.01" // Permite casas decimais
                  min="0"
                  placeholder="Ex: 99.90"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Departamento</Form.Label>
                <Form.Select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  disabled={loading}
                  required
                >
                  <option value="">Selecione o departamento</option>
                  {departments.map((dep) => (
                    <option key={dep.id} value={dep.id}>
                      {dep.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Form>
          )}
          {loading && (
            <div className="text-center my-2">
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>{' '}
              Processando...
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {!editMode ? (
            <>
              {!deleting ? (
                <>
                  <Button variant="primary" onClick={handleEditClick} disabled={loading}>
                    Editar
                  </Button>
                  <Button variant="danger" onClick={handleDelete} disabled={loading}>
                    Excluir
                  </Button>
                  <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
                    Fechar
                  </Button>
                </>
              ) : (
                <div className="w-100 text-center fw-bold fs-5 text-danger">Excluindo...</div>
              )}
            </>
          ) : (
            <>
              <Button variant="success" onClick={handleSubmit} disabled={loading || deleting}>
                Salvar
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProductsDataTable;
