export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
}


const API_URL = 'http://localhost:8080/api/usuarios';
const API_TOTAL_URL = 'http://localhost:8080/api/usuarios/total';

export async function fetchUserById(id: string, token?: string): Promise<User> {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error('Erro ao buscar usuário');
  return await response.json();
}

export async function fetchUsersTotal(token: string): Promise<number> {
  const response = await fetch(API_TOTAL_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erro ao buscar total de usuários');
  const data = await response.json();
  return typeof data === 'number' ? data : data.total ?? 0;
}


export async function fetchUsers(token: string): Promise<User[]> {
  const response = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erro ao buscar usuários');
  return response.json();
}

export async function createUser(token: string, user: Omit<User, 'id'>): Promise<User> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(user),
  });
  if (!response.ok) throw new Error('Erro ao criar usuário');
  return response.json();
}

export async function updateUser(token: string, user: User): Promise<User> {
  const response = await fetch(`${API_URL}/${user.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(user),
  });
  if (!response.ok) throw new Error('Erro ao atualizar usuário');
  return response.json();
}

export async function deleteUser(token: string, id: string): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erro ao excluir usuário');
}
