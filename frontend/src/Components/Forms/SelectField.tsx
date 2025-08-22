import React from 'react';
import { Form } from 'react-bootstrap';

interface SelectFieldProps {
  label: string;
  value: string;
  name: string;
  options: { value: string; label: string }[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, value, name, options, onChange, required }) => (
  <Form.Group className="mb-3">
    <Form.Label>{label}</Form.Label>
    <Form.Select name={name} value={value} onChange={onChange} required={required}>
      <option value="">Selecione...</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </Form.Select>
  </Form.Group>
);

export default SelectField;
