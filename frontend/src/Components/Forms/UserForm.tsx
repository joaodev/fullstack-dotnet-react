import React from 'react';

interface UserFormProps {
  name: string;
  email: string;
  password: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ name, email, password, error, onChange, onSubmit, onCancel }) => (
  <form onSubmit={onSubmit}>
    {error && <div className={`alert alert-danger`}>{error}</div>}
    <div className="mb-3">
      <label className="form-label">Nome</label>
      <input
        type="text"
        className="form-control"
        name="name"
        value={name}
        onChange={onChange}
        required
      />
    </div>
    <div className="mb-3">
      <label className="form-label">E-mail</label>
      <input
        type="email"
        className="form-control"
        name="email"
        value={email}
        onChange={onChange}
        required
      />
    </div>
    <div className="mb-3">
      <label className="form-label">Senha</label>
      <input
        type="password"
        className="form-control"
        name="password"
        value={password}
        onChange={onChange}
        required
        minLength={6}
      />
    </div>
    <div className="modal-footer">
      <button type="button" className="btn btn-secondary" onClick={onCancel}>
        Cancelar
      </button>
      <button type="submit" className="btn btn-primary">
        Cadastrar
      </button>
    </div>
  </form>
);

export default UserForm;
