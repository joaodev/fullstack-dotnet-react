
import React from 'react';
import TextField from './TextField';
import FormFeedback from './FormFeedback';
import FormActions from './FormActions';

interface UserFormProps {
  name: string;
  email: string;
  password: string;
  error?: string;
  loading?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ name, email, password, error, loading, onChange, onSubmit, onCancel }) => (
  <form onSubmit={onSubmit}>
    {error && <FormFeedback type="danger" message={error} />}
    <TextField label="Nome" name="name" value={name} onChange={onChange} required />
    <TextField label="E-mail" name="email" value={email} onChange={onChange} type="email" required />
    <TextField label="Senha" name="password" value={password} onChange={onChange} type="password" required />
    <FormActions onCancel={onCancel} loading={loading} submitLabel="Salvar" />
  </form>
);

export default UserForm;
