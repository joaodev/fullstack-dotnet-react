import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface UserModalProps {
  show: boolean;
  onHide: () => void;
  title?: string;
  name: string;
  email: string;
  password?: string;
  loading?: boolean;
  onChangeName: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeEmail: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangePassword?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: (e: React.FormEvent) => void;
}

const UserModal: React.FC<UserModalProps> = ({
  show,
  onHide,
  title = 'Editar Usuário',
  name,
  email,
  password,
  loading,
  onChangeName,
  onChangeEmail,
  onChangePassword,
  onSave,
}) => (
  <Modal show={show} onHide={onHide} centered dialogClassName="modal-lg">
    <Modal.Header closeButton className="border-0">
      <Modal.Title>{title}</Modal.Title>
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
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={onChangeEmail}
            disabled={loading}
            required
          />
        </div>
        {typeof password !== 'undefined' && onChangePassword && (
          <div className="mb-3">
            <label className="form-label">Senha</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={onChangePassword}
              disabled={loading}
              required
            />
          </div>
        )}
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

export default UserModal;
