import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Form } from 'react-bootstrap';
import { fetchDepartments } from '../services/departmentService';
import { updateUser } from '../services/userService';
import { getUserFromToken } from '../services/authUtils';

const Profile: React.FC<{}> = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  // Removido campo departamento
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [passwordHash, setPasswordHash] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');


  useEffect(() => {
    // Carregar dados do usuário do localStorage (preferencialmente atualizados)
    let foundId = '';
    let foundName = '';
    let foundEmail = '';
    const userDataStr = localStorage.getItem('userData');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        foundId = userData.id || '';
        foundName = userData.name || '';
        foundEmail = userData.email || '';
      } catch {}
    }
    if (!foundId) {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = getUserFromToken(token);
        if (userData) {
          foundId = userData.id || '';
          foundName = userData.name || '';
          foundEmail = userData.email || '';
        }
      }
    }
    setId(foundId);
    setName(foundName);
    setEmail(foundEmail);
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('ID enviado:', id);
    const payload: any = {
      id,
      name,
      email,
    };
    if (passwordHash) payload.passwordHash = passwordHash;
    console.log('Payload:', payload);
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    if (passwordHash && passwordHash !== confirmPassword) {
      setError('As senhas não coincidem.');
      setSaving(false);
      return;
    }
    const token = localStorage.getItem('token') || '';
    try {
      const payload: any = {
        id,
        name,
        email,
      };
      if (passwordHash) payload.passwordHash = passwordHash;
  // updateUser faz PUT /usuarios/{id}
  const updated = await updateUser(token, payload);
      setSuccess('Perfil atualizado com sucesso!');
      setShowToast(true);
      // Atualiza dados do usuário no localStorage
      const newName = updated.name || name;
      const newEmail = updated.email || email;
      const userData = {
        id,
        name: newName,
        email: newEmail,
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      setName(newName);
      setEmail(newEmail);
    } catch (err: any) {
      // O updateUser agora lança Error com a mensagem personalizada do backend
      setError(err?.message || 'Erro ao atualizar perfil.');
      setShowToast(true);
    }
    setSaving(false);
  };

  return (
  <div>
      {showToast && (success || error) && (
        <div style={{ position: 'fixed', top: 32, right: 32, zIndex: 9999, minWidth: 320 }}>
          <div
            className={`toast show animate__animated animate__fadeIn border-0 shadow-lg ${success ? 'bg-success' : 'bg-danger'} text-white`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            style={{ fontSize: '1.1rem', borderRadius: 12 }}
          >
            <div className="toast-header bg-transparent border-0 text-white d-flex align-items-center">
              {success && (
                <span className="me-2" style={{ fontSize: '1.5rem', color: '#fff' }}><i className="bi bi-check-circle-fill"></i></span>
              )}
              {error && (
                <span className="me-2" style={{ fontSize: '1.5rem', color: '#fff' }}><i className="bi bi-x-circle-fill"></i></span>
              )}
              <strong className="me-auto">
                {success || error}
              </strong>
              <button type="button" className="btn-close btn-close-white ms-2" onClick={() => setShowToast(false)}></button>
            </div>
          </div>
        </div>
      )}
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
              <Form.Group className="mb-3">
                <Form.Label>E-mail</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </Form.Group>
              <div className="d-flex gap-3 mb-3">
                <Form.Group className="flex-fill">
                  <Form.Label>Nova senha</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordHash}
                    onChange={e => setPasswordHash(e.target.value)}
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
    </div>
  );
}

export default Profile;
