import React from 'react';
import { Form } from 'react-bootstrap';

interface EditProductFormProps {
  description: string;
  price: string | number;
  departmentId: string;
  departments: { id: string; name: string }[];
  loading?: boolean;
  onChangeDescription: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangePrice: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeDepartment: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

function formatBRLMask(value: string | number) {
  // Garante que o valor é uma string
  const strValue = typeof value === 'number' ? value.toString() : value;
  // Remove tudo que não for número
  let cleaned = strValue.replace(/\D/g, '');
  if (!cleaned) return '';
  // Garante pelo menos dois dígitos para os centavos
  if (cleaned.length <= 2) {
    return '0,' + cleaned.padStart(2, '0');
  }
  const cents = cleaned.slice(-2);
  let integer = cleaned.slice(0, -2).replace(/^0+/, ''); // Remove zeros à esquerda
  // Adiciona separador de milhar
  integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (integer ? integer : '0') + ',' + cents;
}

const EditProductForm: React.FC<EditProductFormProps> = ({
  description,
  price,
  departmentId,
  departments,
  loading,
  onChangeDescription,
  onChangePrice,
  onChangeDepartment,
}) => {
  // Sempre exibe o valor formatado no padrão brasileiro
  let displayPrice = '';
  if (typeof price === 'number') {
    // Converte número para string sem notação científica, com separador de milhar e centavos
    displayPrice = price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (typeof price === 'string') {
    // Se já está no padrão, mantém, senão aplica máscara
    // Se vier do backend como string, pode estar sem máscara
    displayPrice = formatBRLMask(price);
  }

  // Handler para aplicar máscara BRL e retornar valor formatado para o pai
  const handleMaskedPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = formatBRLMask(e.target.value);
    onChangePrice({ ...e, target: { ...e.target, value: masked } });
  };
  return (
    <Form>
    <Form.Group className="mb-3">
      <Form.Label>Nome</Form.Label>
      <Form.Control
        type="text"
        value={description}
        onChange={onChangeDescription}
        disabled={loading}
        autoFocus
        className="shadow-sm"
      />
    </Form.Group>
    <Form.Group className="mb-3">
      <Form.Label>Preço</Form.Label>
      <Form.Control
        type="text"
        value={displayPrice}
        onChange={handleMaskedPrice}
        disabled={loading}
        required
        inputMode="decimal"
        placeholder="Ex: 1.212,34"
        className="shadow-sm"
      />
    </Form.Group>
    <Form.Group className="mb-3">
      <Form.Label>Departamento</Form.Label>
      <Form.Select
        value={departmentId}
        onChange={onChangeDepartment}
        disabled={loading}
        required
        className="shadow-sm"
      >
        <option value="">Selecione o departamento</option>
        {departments && departments.length > 0 ? (
          departments.map((dep) => (
            <option key={dep.id} value={dep.id}>
              {dep.name}
            </option>
          ))
        ) : (
          <option value="" disabled>Nenhum departamento disponível</option>
        )}
      </Form.Select>
    </Form.Group>
    </Form>
  );
};

export default EditProductForm;
