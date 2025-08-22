import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Form, Row, Col, Toast, ToastContainer } from 'react-bootstrap';
import { FaEdit, FaTrash, FaFileCsv } from 'react-icons/fa';
import 'animate.css';

interface Product {
  id: string;
  code: string;
  description: string;
  price: number;
  departmentId?: string;
}

interface ProductsDataTableProps {
  data: Product[];
  onOpenModal?: () => void;
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

const ProductsDataTable: React.FC<ProductsDataTableProps> = ({ data, onOpenModal }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'atualizado' | 'excluido' | 'erro' | null>(null);
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
  setFeedback({ type: 'success', message: 'Produto atualizado com sucesso!' });
  setToastType('atualizado');
  setShowToast(true);
  setLoading(false);
  setShowModal(false);
  setSelectedProduct(null);
  setEditMode(false);
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
  setToastType('excluido');
  setShowToast(true);
  setLoading(false);
  setShowModal(false);
  setSelectedProduct(null);
  setDeleting(false); // Desativa o estado de exclusão
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
  setToastType('atualizado');
  setShowToast(true);
  setLoading(false);
  setShowModal(false);
  setSelectedProduct(null);
  setEditMode(false);
  };

  return (
    <>
      {/* Toast flutuante de feedback com diferenciação */}
      <div style={{ position: 'fixed', top: 32, right: 32, zIndex: 9999, minWidth: 320 }}>
        {feedback && showToast && (
          <div
            className={`toast show animate__animated animate__fadeIn border-0 shadow-lg ${feedback.type === 'success' ? 'bg-success' : 'bg-danger'} text-white`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            style={{ fontSize: '1.1rem', borderRadius: 12 }}
          >
            <div className="toast-header bg-transparent border-0 text-white d-flex align-items-center">
              {feedback.type === 'success' && toastType === 'atualizado' && (
                <span className="me-2" style={{ fontSize: '1.5rem', color: '#fff' }}><i className="bi bi-pencil-fill"></i></span>
              )}
              {feedback.type === 'success' && toastType === 'excluido' && (
                <span className="me-2" style={{ fontSize: '1.5rem', color: '#fff' }}><i className="bi bi-trash-fill"></i></span>
              )}
              {feedback.type === 'danger' && (
                <span className="me-2" style={{ fontSize: '1.5rem', color: '#fff' }}><i className="bi bi-x-circle-fill"></i></span>
              )}
              <strong className="me-auto">
                {feedback.type === 'success' && toastType === 'atualizado' && 'Produto atualizado com sucesso!'}
                {feedback.type === 'success' && toastType === 'excluido' && 'Produto excluído com sucesso!'}
                {feedback.type === 'danger' && 'Ocorreu um erro ao atualizar/excluir o produto.'}
              </strong>
              <button type="button" className="btn-close btn-close-white ms-2" onClick={() => setShowToast(false)}></button>
            </div>
          </div>
        )}
      </div>
      <Row className="g-3 mb-3 align-items-end">
        <Col xs={12} md={3}>
          <Form.Label className="fw-bold">Buscar</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nome ou código..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="shadow-sm"
          />
        </Col>
        <Col xs={6} md={2}>
          <Form.Label className="fw-bold">Preço mínimo</Form.Label>
          <Form.Control
            type="number"
            placeholder="Mínimo"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="shadow-sm"
          />
        </Col>
        <Col xs={6} md={2}>
          <Form.Label className="fw-bold">Preço máximo</Form.Label>
          <Form.Control
            type="number"
            placeholder="Máximo"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="shadow-sm"
          />
        </Col>
        <Col xs={12} md={3}>
          <Form.Label className="fw-bold">Departamento</Form.Label>
          <Form.Select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="shadow-sm"
          >
            <option value="">Todos</option>
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
        <Col xs={12} md={2}>
          <Button
            variant="success"
            className="w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm"
            onClick={exportToCSV}
          >
            <FaFileCsv /> Exportar CSV
          </Button>
        </Col>
      </Row>
      <div className="table-responsive rounded-3 border shadow-lg overflow-auto">
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          highlightOnHover
          striped
          responsive
          onRowClicked={handleRowClicked}
          customStyles={{
            rows: { style: { minHeight: '48px' } },
            headCells: { style: { fontWeight: 'bold', fontSize: '1rem' } },
          }}
        />
      </div>

      <Modal show={showModal} onHide={handleCloseModal} centered dialogClassName="modal-lg">
        <Modal.Header closeButton className="border-0">
          <Modal.Title>
            {editMode ? 'Editar Produto' : 'Detalhes do Produto'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light animate__animated animate__fadeIn">
          {feedback && (
            <ToastContainer position="top-end" className="p-3">
              <Toast
                bg={feedback.type}
                show={!!feedback}
                onClose={() => setFeedback(null)}
                delay={3000}
                autohide
                className="animate__animated animate__fadeIn"
              >
                <Toast.Body className="fw-bold fs-5">{feedback.message}</Toast.Body>
              </Toast>
            </ToastContainer>
          )}
          {selectedProduct && !editMode && (
            <div className="card shadow-lg p-3 mb-2 rounded-3 border animate__animated animate__fadeIn">
              <div className="mb-2">
                <strong>Código:</strong> {selectedProduct.code}
              </div>
              <div className="mb-2">
                <strong>Nome:</strong> {selectedProduct.description}
              </div>
              <div className="mb-2">
                <strong>Departamento:</strong> {selectedProduct.departmentId}
              </div>
              <div className="mb-2">
                <strong>Preço:</strong>{' '}
                {Number(selectedProduct.price).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </div>
            </div>
          )}
          {selectedProduct && editMode && (
            <Form onSubmit={handleSubmit} className="animate__animated animate__fadeIn">
              <Form.Group className="mb-3">
                <Form.Label>Nome</Form.Label>
                <Form.Control
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  disabled={loading}
                  autoFocus
                  className="shadow-sm"
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
                  step="0.01"
                  min="0"
                  placeholder="Ex: 99.90"
                  className="shadow-sm"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Departamento</Form.Label>
                <Form.Select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  disabled={loading}
                  required
                  className="shadow-sm"
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
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>{' '}
              Processando...
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          {!editMode ? (
            <>
              {!deleting ? (
                <>
                  <Button variant="primary" size="lg" onClick={handleEditClick} disabled={loading}>
                    <FaEdit className="me-2" /> Editar
                  </Button>
                  <Button variant="danger" size="lg" onClick={handleDelete} disabled={loading}>
                    <FaTrash className="me-2" /> Excluir
                  </Button>
                  <Button variant="secondary" size="lg" onClick={handleCloseModal} disabled={loading}>
                    Fechar
                  </Button>
                </>
              ) : (
                <div className="w-100 text-center fw-bold fs-5 text-danger">Excluindo...</div>
              )}
            </>
          ) : (
            <Button variant="success" size="lg" onClick={handleSubmit} disabled={loading || deleting}>
              Salvar
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProductsDataTable;
