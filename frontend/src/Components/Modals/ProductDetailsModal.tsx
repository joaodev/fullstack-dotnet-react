import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface ProductDetailsModalProps {
  show: boolean;
  onHide: () => void;
  product: {
    code: string;
    description: string;
    departmentId: string;
    departmentTitle: string;
    price: number;
  } | null;
  loading?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  deleting?: boolean;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  show,
  onHide,
  product,
  loading,
  onEdit,
  onDelete,
  deleting,
}) => (
  <Modal show={show} onHide={onHide} centered dialogClassName="modal-lg">
    <Modal.Header closeButton className="border-0">
      <Modal.Title>Detalhes do Produto</Modal.Title>
    </Modal.Header>
    <Modal.Body className="bg-light animate__animated animate__fadeIn">
      {product && (
  <div className="card shadow-lg p-3 mb-2 rounded-3 animate__animated animate__fadeIn" style={{ border: 'none', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
          <div className="mb-2">
            <strong>Código:</strong> {product.code}
          </div>
          <div className="mb-2">
            <strong>Nome:</strong> {product.description}
          </div>
          <div className="mb-2">
            <strong>Departamento:</strong> {product.departmentTitle}
          </div>
          <div className="mb-2">
            <strong>Preço:</strong>{' '}
            {Number(product.price).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </div>
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
          <Button variant="primary" size="lg" onClick={(e) => { e.stopPropagation(); if (onEdit) onEdit(); }} disabled={loading}>
            Editar
          </Button>
          <Button variant="danger" size="lg" onClick={(e) => { e.stopPropagation(); if (onDelete) onDelete(); }} disabled={loading}>
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

export default ProductDetailsModal;
