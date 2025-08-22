import React from 'react';
import { Modal } from 'react-bootstrap';
import TextField from '../Forms/TextField';
import FormActions from '../Forms/FormActions';
import FormFeedback from '../Forms/FormFeedback';

interface UserEditModalProps {
  show: boolean;
  onHide: () => void;
  name: string;
  email: string;
  error?: string;
  loading?: boolean;
  onChangeName: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeEmail: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: (e: React.FormEvent) => void;
  onCancel?: () => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({
  show,
  onHide,
  name,
  email,
  error,
  loading,
  onChangeName,
  onChangeEmail,
  onSave,
  onCancel,
}) => (
  <Modal show={show} onHide={onHide} centered dialogClassName="modal-lg">
    <Modal.Header closeButton className="border-0">
      <Modal.Title>Editar Usuário</Modal.Title>
    </Modal.Header>
    <Modal.Body className="bg-light animate__animated animate__fadeIn">
      <form onSubmit={onSave}>
        {error && <FormFeedback type="danger" message={error} />}
        <TextField label="Nome" name="name" value={name} onChange={onChangeName} required />
        <TextField label="Email" name="email" value={email} onChange={onChangeEmail} type="email" required />
        <FormActions onCancel={onCancel ? onCancel : onHide} loading={loading} submitLabel="Salvar" />
      </form>
    </Modal.Body>
  </Modal>
);

export default UserEditModal;
