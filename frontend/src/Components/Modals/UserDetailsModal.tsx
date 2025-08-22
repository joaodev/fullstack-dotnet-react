import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface UserDetailsModalProps {
  show: boolean;
  onHide: () => void;
  user: {
    name: string;
    email: string;
    id?: string;
  } | null;
  loading?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  deleting?: boolean;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  show,
  onHide,
  user,
  loading,
  onEdit,
  onDelete,
  deleting,
}) => (
  <Modal show={show} onHide={onHide} centered dialogClassName="modal-lg">
    <Modal.Header closeButton className="border-0">
      <Modal.Title>Detalhes do Usuário</Modal.Title>
    </Modal.Header>
    <Modal.Body className="bg-light animate__animated animate__fadeIn">
      {user && (
        <div className="card shadow-lg p-3 mb-2 rounded-3 border animate__animated animate__fadeIn">
          <div className="mb-2">
            <strong>Nome:</strong> {user.name}
          </div>
          <div className="mb-2">
            <strong>Email:</strong> {user.email}
          </div>
          {user.id && (
            <div className="mb-2">
              <strong>ID:</strong> {user.id}
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

export default UserDetailsModal;
