import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Form, Row, Col } from 'react-bootstrap';

interface Department {
  id: string;
  name: string;
}

interface DepartmentsDataTableProps {
  data: Department[];
}

const columns: TableColumn<Department>[] = [
  {
    name: 'ID',
    selector: (row) => row.id,
    sortable: true,
  },
  {
    name: 'Nome',
    selector: (row) => row.name,
    sortable: true,
  },
];

const DepartmentsDataTable: React.FC<DepartmentsDataTableProps> = ({ data }) => {
  const [filterText, setFilterText] = useState('');
  const [filteredData, setFilteredData] = useState<Department[]>(data);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; message: string } | null>(
    null,
  );
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    setFilteredData(
      data.filter(
        (item: Department) =>
          item.name.toLowerCase().includes(filterText.toLowerCase()) ||
          item.id.toLowerCase().includes(filterText.toLowerCase()),
      ),
    );
  }, [filterText, data]);

  const exportToCSV = () => {
    const csvRows = [];
    const headers = ['ID', 'Nome'];
    csvRows.push(headers.join(','));
    filteredData.forEach((item: Department) => {
      csvRows.push([item.id, item.name].join(','));
    });
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'departamentos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Funções para editar e excluir (apenas exemplo, implementar integração depois)
  const handleEditClick = () => {
    if (!selectedDepartment) return;
    setEditName(selectedDepartment.name);
    setEditMode(true);
    setFeedback(null);
  };

  const handleEditSave = async () => {
    if (!selectedDepartment) return;
    if (!editName || editName === selectedDepartment.name) return;
    setLoading(true);
    setFeedback(null);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `http://localhost:8080/api/departamentos/${selectedDepartment.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: editName }),
        },
      );
      if (!response.ok) {
        setFeedback({ type: 'danger', message: 'Erro ao editar departamento' });
        setLoading(false);
        return;
      }
      setFilteredData((prev) =>
        prev.map((dep) => (dep.id === selectedDepartment.id ? { ...dep, name: editName } : dep)),
      );
      setFeedback({ type: 'success', message: 'Departamento editado com sucesso!' });
      setLoading(false);
      setTimeout(() => {
        setShowModal(false);
        setSelectedDepartment(null);
        setFeedback(null);
        setEditMode(false);
      }, 3000);
    } catch (err) {
      setFeedback({ type: 'danger', message: 'Erro ao editar departamento' });
      setLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditMode(false);
    setFeedback(null);
  };

  const handleDelete = async () => {
    if (!selectedDepartment) return;
    if (!window.confirm('Tem certeza que deseja excluir este departamento?')) return;
    setLoading(true);
    setFeedback(null);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `http://localhost:8080/api/departamentos/${selectedDepartment.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) {
        setFeedback({ type: 'danger', message: 'Erro ao excluir departamento' });
        setLoading(false);
        return;
      }
      setFilteredData((prev) => prev.filter((dep) => dep.id !== selectedDepartment.id));
      setFeedback({ type: 'success', message: 'Departamento excluído com sucesso!' });
      setLoading(false);
      setTimeout(() => {
        setShowModal(false);
        setSelectedDepartment(null);
        setFeedback(null);
      }, 3000);
    } catch (err) {
      setFeedback({ type: 'danger', message: 'Erro ao excluir departamento' });
      setLoading(false);
    }
  };

  const handleRowClicked = (row: Department) => {
    setSelectedDepartment(row);
    setShowModal(true);
    setEditMode(false);
    setFeedback(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDepartment(null);
    setEditMode(false);
    setFeedback(null);
  };

  return (
    <>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Buscar por nome ou ID..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </Col>
        <Col md={2}>
          <button className="btn btn-success w-100" onClick={exportToCSV}>
            Exportar CSV
          </button>
        </Col>
      </Row>
      <DataTable
        title="Departamentos"
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
          <Modal.Title>{editMode ? 'Editar Departamento' : 'Detalhes do Departamento'}</Modal.Title>
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
          {selectedDepartment && !editMode && (
            <>
              <p>
                <strong>ID:</strong> {selectedDepartment.id}
              </p>
              <p>
                <strong>Nome:</strong> {selectedDepartment.name}
              </p>
            </>
          )}
          {selectedDepartment && editMode && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nome</Form.Label>
                <Form.Control
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
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
            <>
              <Button variant="success" onClick={handleEditSave} disabled={loading}>
                Salvar
              </Button>
              <Button variant="outline-secondary" onClick={handleEditCancel} disabled={loading}>
                Voltar
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DepartmentsDataTable;
