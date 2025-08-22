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
        <div className="card shadow-sm p-3 mb-3 rounded-3 border-0 bg-white animate__animated animate__fadeIn">
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
    <Modal.Footer className="border-0 d-flex justify-content-end gap-2">
      <Button variant="secondary" onClick={onHide} disabled={loading}>
        Fechar
      </Button>
      {onEdit && (
        <Button variant="success" onClick={onEdit} disabled={loading}>
          Editar
        </Button>
      )}
      {onDelete && (
        <Button variant="danger" onClick={onDelete} disabled={deleting || loading}>
          {deleting ? 'Excluindo...' : 'Excluir'}
        </Button>
      )}
    </Modal.Footer>
  </Modal>
);

export default DepartmentDetailsModal;
