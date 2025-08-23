export interface Product {
  id: string;
  code: string;
  description: string;
  price: number;
  departmentId?: string;
}

const API_URL = 'http://localhost:8080/api/produtos';


export async function fetchProducts(token: string): Promise<Product[]> {
  const response = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erro ao buscar produtos');
  return response.json();
}

export async function createProduct(token: string, product: Omit<Product, 'id'>): Promise<Product> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  });
  if (!response.ok) throw new Error('Erro ao criar produto');
  return response.json();
}

export async function updateProduct(token: string, product: Product): Promise<Product> {
  const response = await fetch(`${API_URL}/${product.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  });
  if (!response.ok) throw new Error('Erro ao atualizar produto');
  return response.json();
}

export async function deleteProduct(token: string, id: string): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erro ao excluir produto');
}
