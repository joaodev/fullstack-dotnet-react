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
  <Modal show={show} onHide={onHide} centered dialogClassName="modal-lg animate__animated animate__fadeIn">
    <Modal.Header closeButton className="border-0 bg-white">
      <Modal.Title className="fw-bold">Detalhes do Departamento</Modal.Title>
    </Modal.Header>
    <Modal.Body className="bg-light p-4">
      {department && (
        <div className="card shadow-sm p-4 mb-3 rounded-3 border-0 bg-white animate__animated animate__fadeIn">
          <div className="mb-3">
            <span className="fw-bold">Nome:</span> {department.name}
          </div>
          {department.id && (
            <div className="mb-3">
              <span className="fw-bold">ID:</span> {department.id}
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
    <Modal.Footer className="border-0 d-flex justify-content-end gap-2 bg-white">
      {!deleting ? (
        <>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            <i className="bi bi-x-circle me-1"></i> Fechar
          </Button>
          {onEdit && (
            <Button variant="success" onClick={onEdit} disabled={loading}>
              <i className="bi bi-pencil-square me-1"></i> Editar
            </Button>
          )}
          {onDelete && (
            <Button variant="danger" onClick={onDelete} disabled={loading}>
              <i className="bi bi-trash me-1"></i>Excluir
            </Button>
          )}
        </>
      ) : (
        <div className="w-100 text-center fw-bold fs-5 text-danger">Excluindo...</div>
      )}
    </Modal.Footer>
  </Modal>
);

export default DepartmentDetailsModal;
