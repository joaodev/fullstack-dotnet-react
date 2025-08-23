import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Form } from 'react-bootstrap';
import { fetchDepartments } from '../services/departmentService';
import { getUserFromToken } from '../services/authUtils';

const Perfil: React.FC<{}> = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');


  useEffect(() => {
    // Carregar dados do usuário a partir do token
    const token = localStorage.getItem('token');
    if (token) {
      const userData = getUserFromToken(token);
      if (userData) {
        setId(userData.id || '');
        setName(userData.name || '');
        setEmail(userData.email || '');
      }
    }
    // Carregar departamentos via serviço
    fetchDepartments(token || '')
      .then(data => setDepartments(Array.isArray(data) ? data : []))
      .catch(() => setDepartments([]));
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Adicione aqui a lógica de submissão do formulário, como chamada à API, validação, etc.
    // Exemplo:
    // setSaving(true);
    // try {
    //   await updateProfile({ name, email, departmentId, currentPassword, newPassword });
    //   setSuccess('Perfil atualizado com sucesso!');
    //   setError('');
    // } catch (err) {
    //   setError('Erro ao atualizar perfil.');
    //   setSuccess('');
    // }
    // setSaving(false);
    // setShowToast(true);
  };

  return (
    <Container style={{ maxWidth: 800 }}>
      <Card className="shadow-sm">
        <Card.Body>
          <h3 className="mb-4 fw-bold">Meu Perfil</h3>
          <hr />
          <Form onSubmit={handleSubmit} autoComplete="off">
            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </Form.Group>
            <div className="d-flex gap-3 mb-3">
              <Form.Group className="flex-fill">
                <Form.Label>E-mail</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="flex-fill">
                <Form.Label>Departamento</Form.Label>
                <Form.Select
                  value={departmentId}
                  onChange={e => setDepartmentId(e.target.value)}
                  required
                >
                  <option value="">Selecione...</option>
                  {departments.map(dep => (
                    <option key={dep.id} value={dep.id}>{dep.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            <div className="d-flex gap-3 mb-3">
              <Form.Group className="flex-fill">
                <Form.Label>Nova senha</Form.Label>
                <Form.Control
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                  autoComplete="new-password"
                />
              </Form.Group>
              <Form.Group className="flex-fill">
                <Form.Label>Confirmar nova senha</Form.Label>
                <Form.Control
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a nova senha"
                  autoComplete="new-password"
                />
              </Form.Group>
            </div>
            <hr />
            <Button type="submit" variant="primary" disabled={saving} className="w-100">
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Perfil;
