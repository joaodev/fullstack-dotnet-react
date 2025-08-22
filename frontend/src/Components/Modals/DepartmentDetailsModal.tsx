import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface DepartmentDetailsModalProps {
  show: boolean;
  onHide: () => void;
  department: {
    name: string;
    id?: string;
  } | null;
  loading?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  deleting?: boolean;
}

const DepartmentDetailsModal: React.FC<DepartmentDetailsModalProps> = ({
  show,
  onHide,
  department,
  loading,
  onEdit,
  onDelete,
  deleting,
}) => (
  <Modal show={show} onHide={onHide} centered dialogClassName="modal-lg">
    <Modal.Header closeButton className="border-0">
      <Modal.Title>Detalhes do Departamento</Modal.Title>
    </Modal.Header>
    <Modal.Body className="bg-light animate__animated animate__fadeIn">
      {department && (
        <div className="card shadow-lg p-3 mb-2 rounded-3 border animate__animated animate__fadeIn">
          <div className="mb-2">
            <strong>Nome:</strong> {department.name}
          </div>
          {department.id && (
            <div className="mb-2">
              <strong>ID:</strong> {department.id}
            </div>
          )}
        </div>
      )}
      {loading && (
        <div className="text-center my-2">
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>{' '}
          Processando...
        </div>
      )}
    </Modal.Body>
    <Modal.Footer className="border-0">
      {!deleting ? (
        <>
          <Button variant="primary" size="lg" onClick={onEdit} disabled={loading}>
            Editar
          </Button>
          <Button variant="danger" size="lg" onClick={onDelete} disabled={loading}>
            Excluir
          </Button>
          <Button variant="secondary" size="lg" onClick={onHide} disabled={loading}>
            Fechar
          </Button>
        </>
      ) : (
        <div className="w-100 text-center fw-bold fs-5 text-danger">Excluindo...</div>
      )}
    </Modal.Footer>
  </Modal>
);

export default DepartmentDetailsModal;
