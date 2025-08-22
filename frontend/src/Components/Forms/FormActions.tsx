import React from 'react';
import { Button } from 'react-bootstrap';

interface FormActionsProps {
  onCancel: () => void;
  submitLabel?: string;
  loading?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({ onCancel, submitLabel = 'Salvar', loading }) => (
  <div className="modal-footer">
    <Button variant="secondary" onClick={onCancel} disabled={loading}>
      Cancelar
    </Button>
    <Button type="submit" variant="success" disabled={loading}>
      {loading ? 'Salvando...' : submitLabel}
    </Button>
  </div>
);

export default FormActions;
