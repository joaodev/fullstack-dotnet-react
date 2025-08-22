import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import EditProductForm from '../Forms/EditProductForm';

interface EditProductModalProps {
  show: boolean;
  onHide: () => void;
  title?: string;
  description: string;
  price: string | number;
  departmentId: string;
  departments: { id: string; name: string }[];
  loading?: boolean;
  onChangeDescription: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangePrice: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeDepartment: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSave: (e: React.FormEvent) => void;
}

const EditProductModal: React.FC<EditProductModalProps & { onCancel?: () => void }> = ({
  show,
  onHide,
  title = 'Editar Produto',
  description,
  price,
  departmentId,
  departments,
  loading,
  onChangeDescription,
  onChangePrice,
  onChangeDepartment,
  onSave,
  onCancel,
}) => (
  <Modal show={show} onHide={onHide} centered dialogClassName="modal-lg">
    <Modal.Header closeButton className="border-0">
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body className="bg-light animate__animated animate__fadeIn">
      <EditProductForm
        description={description}
        price={price}
        departmentId={departmentId}
        departments={departments}
        loading={loading}
        onChangeDescription={onChangeDescription}
        onChangePrice={onChangePrice}
        onChangeDepartment={onChangeDepartment}
      />
    </Modal.Body>
    <Modal.Footer className="border-0">
      <Button variant="secondary" size="lg" onClick={onCancel ? onCancel : onHide} disabled={loading}>
        Cancelar
      </Button>
      <Button variant="success" size="lg" onClick={onSave} disabled={loading} type="submit">
        Salvar
      </Button>
    </Modal.Footer>
  </Modal>
);

export default EditProductModal;
