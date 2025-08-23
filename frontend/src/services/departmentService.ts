export interface Department {
  id: string;
  name: string;
}


const API_URL = 'http://localhost:8080/api/departamentos';
const API_TOTAL_URL = 'http://localhost:8080/api/departamentos/total';

export async function fetchDepartmentsTotal(token: string): Promise<number> {
  const response = await fetch(API_TOTAL_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erro ao buscar total de departamentos');
  const data = await response.json();
  return typeof data === 'number' ? data : data.total ?? 0;
}


export async function fetchDepartments(token: string): Promise<Department[]> {
  const response = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erro ao buscar departamentos');
  return response.json();
}

export async function createDepartment(token: string, department: Omit<Department, 'id'>): Promise<Department> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(department),
  });
  if (!response.ok) throw new Error('Erro ao criar departamento');
  return response.json();
}

export async function updateDepartment(token: string, department: Department): Promise<Department> {
  const response = await fetch(`${API_URL}/${department.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(department),
  });
  if (!response.ok) throw new Error('Erro ao atualizar departamento');
  return response.json();
}

export async function deleteDepartment(token: string, id: string): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erro ao excluir departamento');
}
