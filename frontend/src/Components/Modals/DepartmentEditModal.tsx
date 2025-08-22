import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface DepartmentEditModalProps {
  show: boolean;
  onHide: () => void;
  name: string;
  loading?: boolean;
  onChangeName: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: (e: React.FormEvent) => void;
}

const DepartmentEditModal: React.FC<DepartmentEditModalProps> = ({
  show,
  onHide,
  name,
  loading,
  onChangeName,
  onSave,
}) => (
  <Modal show={show} onHide={onHide} centered dialogClassName="modal-lg">
    <Modal.Header closeButton className="border-0">
      <Modal.Title>Editar Departamento</Modal.Title>
    </Modal.Header>
    <Modal.Body className="bg-light animate__animated animate__fadeIn">
      <form onSubmit={onSave}>
        <div className="mb-3">
          <label className="form-label">Nome</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={onChangeName}
            disabled={loading}
            required
          />
        </div>
        <div className="d-flex justify-content-end gap-2">
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="success" type="submit" disabled={loading}>
            Salvar
          </Button>
        </div>
      </form>
    </Modal.Body>
  </Modal>
);

export default DepartmentEditModal;
