import React from 'react';

interface DepartmentFormProps {
  name: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ name, error, onChange, onSubmit, onCancel }) => (
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

export default DepartmentForm;
