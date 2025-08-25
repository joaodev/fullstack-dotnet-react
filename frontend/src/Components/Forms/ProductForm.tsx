import React from 'react';
import { Button } from 'react-bootstrap';
import { ProductFormProps } from '../../Interfaces/ProductFormProps';

const ProductForm: React.FC<ProductFormProps> = ({ code, description, price, departmentId, departments, error, onChange, onSubmit, onCancel }) => (
  <form onSubmit={onSubmit}>
    {error && <div className="alert alert-danger">{error}</div>}
    <div className="mb-3">
      <label className="form-label">Código</label>
      <input
        type="text"
        className="form-control"
        name="code"
        value={code}
        onChange={onChange}
        required
      />
    </div>
    <div className="mb-3">
      <label className="form-label">Nome</label>
      <input
        type="text"
        className="form-control"
        name="description"
        value={description}
        onChange={onChange}
        required
      />
    </div>
    <div className="mb-3">
      <label className="form-label">Preço</label>
      <input
        type="text"
        className="form-control"
        name="price"
        value={price}
        onChange={onChange}
        required
      />
    </div>
    <div className="mb-3">
      <label className="form-label">Departamento</label>
      <select
        className="form-select"
        name="departmentId"
        value={departmentId}
        onChange={onChange}
        required
      >
        <option value="">Selecione...</option>
        {departments.map((dep) => (
          <option key={dep.id} value={dep.id}>
            {dep.name}
          </option>
        ))}
      </select>
    </div>
    <div className="d-flex justify-content-end gap-2">
      <Button variant="light" onClick={onCancel}>
        Cancelar
      </Button>
      <Button variant="success" type="submit">
        Salvar
      </Button>
    </div>
  </form>
);

export default ProductForm;
