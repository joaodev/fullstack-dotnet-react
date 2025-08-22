import React, { useState, useEffect } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Form, Row, Col, Modal, Button } from 'react-bootstrap';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UsersDataTableProps {
  data: User[];
}

const columns: TableColumn<User>[] = [
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
  {
    name: 'Email',
    selector: (row) => row.email,
    sortable: true,
  },
];

const UsersDataTable: React.FC<UsersDataTableProps> = ({ data }) => {
  const [filterText, setFilterText] = useState('');
  const [filteredData, setFilteredData] = useState<User[]>(data);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; message: string } | null>(
    null,
  );
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const handleEditClick = () => {
    if (!selectedUser) return;
    setEditName(selectedUser.name);
    setEditMode(true);
    setFeedback(null);
  };

  const handleEditSave = async () => {
    if (!selectedUser) return;
    if (!editName || editName === selectedUser.name) return;
    setLoading(true);
    setFeedback(null);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8080/api/usuarios/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...selectedUser, name: editName }),
      });
      if (!response.ok) {
        setFeedback({ type: 'danger', message: 'Erro ao editar usuário' });
        setLoading(false);
        return;
      }
      setFilteredData((prev) =>
        prev.map((user) => (user.id === selectedUser.id ? { ...user, name: editName } : user)),
      );
      setFeedback({ type: 'success', message: 'Usuário editado com sucesso!' });
      setLoading(false);
      setTimeout(() => {
        setShowModal(false);
        setSelectedUser(null);
        setFeedback(null);
        setEditMode(false);
      }, 3000);
    } catch (err) {
      setFeedback({ type: 'danger', message: 'Erro ao editar usuário' });
      setLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditMode(false);
    setFeedback(null);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    setLoading(true);
    setFeedback(null);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8080/api/usuarios/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        setFeedback({ type: 'danger', message: 'Erro ao excluir usuário' });
        setLoading(false);
        return;
      }
      setFilteredData((prev) => prev.filter((user) => user.id !== selectedUser.id));
      setFeedback({ type: 'success', message: 'Usuário excluído com sucesso!' });
      setLoading(false);
      setTimeout(() => {
        setShowModal(false);
        setSelectedUser(null);
        setFeedback(null);
      }, 3000);
    } catch (err) {
      setFeedback({ type: 'danger', message: 'Erro ao excluir usuário' });
      setLoading(false);
    }
  };

  const handleRowClicked = (row: User) => {
    setSelectedUser(row);
    setShowModal(true);
    setEditMode(false);
    setFeedback(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setEditMode(false);
    setFeedback(null);
  };

  useEffect(() => {
    setFilteredData(
      data.filter(
        (item: User) =>
          item.name.toLowerCase().includes(filterText.toLowerCase()) ||
          item.email.toLowerCase().includes(filterText.toLowerCase()) ||
          item.id.toLowerCase().includes(filterText.toLowerCase()),
      ),
    );
  }, [filterText, data]);

  const exportToCSV = () => {
    const csvRows = [];
    const headers = ['ID', 'Nome', 'Email'];
    csvRows.push(headers.join(','));
    filteredData.forEach((item: User) => {
      csvRows.push([item.id, item.name, item.email].join(','));
    });
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'usuarios.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Buscar por nome, email ou ID..."
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
        title="Usuários"
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
          <Modal.Title>{editMode ? 'Editar Usuário' : 'Detalhes do Usuário'}</Modal.Title>
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
          {selectedUser && !editMode && (
            <>
              <p>
                <strong>ID:</strong> {selectedUser.id}
              </p>
              <p>
                <strong>Nome:</strong> {selectedUser.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
            </>
          )}
          {selectedUser && editMode && (
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

export default UsersDataTable;
