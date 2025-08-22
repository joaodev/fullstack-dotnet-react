import React from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

interface LoginFormProps {
  email: string;
  password: string;
  error: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ email, password, error, onEmailChange, onPasswordChange, onSubmit }) => (
  <Form onSubmit={onSubmit}>
    {error && <Alert variant="danger">{error}</Alert>}
    <Form.Group className="mb-3" controlId="formBasicEmail">
      <Form.Label>Email</Form.Label>
      <Form.Control
        type="email"
        value={email}
        onChange={onEmailChange}
        required
      />
    </Form.Group>
    <Form.Group className="mb-3" controlId="formBasicPassword">
      <Form.Label>Senha</Form.Label>
      <Form.Control
        type="password"
        value={password}
        onChange={onPasswordChange}
        required
      />
    </Form.Group>
    <Button variant="primary" type="submit">
      Entrar
    </Button>
  </Form>
);

export default LoginForm;
