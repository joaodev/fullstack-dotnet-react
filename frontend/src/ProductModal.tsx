import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface ProductModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  form: {
    code: string;
    description: string;
    price: string;
    departmentId: string;
  };
  departments: { id: string; name: string }[];
  onChange: (e: React.ChangeEvent<any>) => void;
  loading?: boolean;
  alert?: { type: 'success' | 'danger'; message: string } | null;
  children?: React.ReactNode;
}

const ProductModal: React.FC<ProductModalProps> = ({
  show,
  onHide,
  onSubmit,
  title,
  form,
  departments,
  onChange,
  loading,
  alert,
  children,
}) => (
  <Modal show={show} onHide={onHide} centered dialogClassName="modal-lg">
    <Modal.Header closeButton className="border-0">
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Form onSubmit={onSubmit} className="animate__animated animate__fadeIn">
      <Modal.Body className="bg-light">
        {alert && (
          <div className={`alert alert-${alert.type} animate__animated animate__fadeIn`}>{alert.message}</div>
        )}
        <div className="card shadow-lg p-3 mb-2 rounded-3 border animate__animated animate__fadeIn">
          <Form.Group className="mb-3">
            <Form.Label>Código</Form.Label>
            <Form.Control
              type="text"
              name="code"
              value={form.code}
              onChange={onChange}
              required
              className="shadow-sm"
              disabled={loading}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nome</Form.Label>
            <Form.Control
              type="text"
              name="description"
              value={form.description}
              onChange={onChange}
              required
              className="shadow-sm"
              disabled={loading}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Preço</Form.Label>
            <Form.Control
              type="text"
              name="price"
              value={form.price}
              onChange={onChange}
              required
              className="shadow-sm"
              disabled={loading}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Departamento</Form.Label>
            <Form.Select
              name="departmentId"
              value={form.departmentId}
              onChange={onChange}
              required
              className="shadow-sm"
              disabled={loading}
            >
              <option value="">Selecione...</option>
              {departments.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {dep.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>
        {children}
      </Modal.Body>
      <Modal.Footer className="border-0 d-flex justify-content-end gap-2">
        <Button variant="secondary" size="lg" onClick={onHide} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="primary" size="lg" type="submit" disabled={loading}>
          Salvar
        </Button>
      </Modal.Footer>
    </Form>
  </Modal>
);

export default ProductModal;
