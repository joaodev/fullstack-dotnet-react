import React from 'react';
import { Alert } from 'react-bootstrap';

interface FormFeedbackProps {
  type: 'success' | 'danger';
  message: string;
}

const FormFeedback: React.FC<FormFeedbackProps> = ({ type, message }) => (
  <Alert variant={type} className="mb-2">
    {message}
  </Alert>
);

export default FormFeedback;
