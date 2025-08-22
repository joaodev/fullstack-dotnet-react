
import React from 'react';
import TextField from './TextField';
import FormFeedback from './FormFeedback';
import FormActions from './FormActions';

interface DepartmentFormProps {
  name: string;
  error?: string;
  loading?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ name, error, loading, onChange, onSubmit, onCancel }) => (
  <form onSubmit={onSubmit}>
    {error && <FormFeedback type="danger" message={error} />}
    <TextField label="Nome" name="name" value={name} onChange={onChange} required />
    <FormActions onCancel={onCancel} loading={loading} submitLabel="Salvar" />
  </form>
);

export default DepartmentForm;
