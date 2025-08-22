import React from 'react';
import { Modal } from 'react-bootstrap';
import TextField from '../Forms/TextField';
import FormActions from '../Forms/FormActions';
import FormFeedback from '../Forms/FormFeedback';

interface DepartmentEditModalProps {
  show: boolean;
  onHide: () => void;
  name: string;
  error?: string;
  loading?: boolean;
  onChangeName: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: (e: React.FormEvent) => void;
}

const DepartmentEditModal: React.FC<DepartmentEditModalProps> = ({
  show,
  onHide,
  name,
  error,
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
        {error && <FormFeedback type="danger" message={error} />}
        <TextField label="Nome" name="name" value={name} onChange={onChangeName} required />
        <FormActions onCancel={onHide} loading={loading} submitLabel="Salvar" />
      </form>
    </Modal.Body>
  </Modal>
);

export default DepartmentEditModal;
