import React from 'react';
import { Form } from 'react-bootstrap';

interface TextFieldProps {
  label: string;
  value: string;
  name: string;
  type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const TextField: React.FC<TextFieldProps> = ({ label, value, name, type = 'text', onChange, required }) => (
  <Form.Group className="mb-3">
    <Form.Label>{label}</Form.Label>
    <Form.Control
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
    />
  </Form.Group>
);

export default TextField;
