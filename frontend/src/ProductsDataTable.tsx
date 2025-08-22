import React, { useState, useEffect } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Form, Row, Col } from 'react-bootstrap';

interface Product {
  id: string;
  description: string;
  price: number;
    departmentId?: string;
}

interface ProductsDataTableProps {
  data: Product[];
}

const columns: TableColumn<Product>[] = [
  {
    name: 'ID',
    selector: row => row.id,
    sortable: true,
  },
  {
    name: 'Nome',
    selector: row => row.description,
    sortable: true,
  },
    {
      name: 'Departamento',
      selector: row => row.departmentId || '',
      sortable: true,
    },
  {
    name: 'Preço',
    selector: row => row.price,
    sortable: true,
    right: true,
    cell: row => Number(row.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  },
];

const ProductsDataTable: React.FC<ProductsDataTableProps> = ({ data }) => {
  const exportToCSV = () => {
    const csvRows = [];
    const headers = ['ID', 'Nome', 'Departamento', 'Preço'];
    csvRows.push(headers.join(','));
      filteredData.forEach((item: Product) => {
        csvRows.push([
          item.id,
          item.description,
          item.departmentId || '',
          Number(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        ].join(','));
      });
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'produtos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const [filterText, setFilterText] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filteredData, setFilteredData] = useState<Product[]>(data);
  const [departmentFilter, setDepartmentFilter] = useState('');

  useEffect(() => {
    setFilteredData(
      data.filter((item: Product) => {
        const matchesText =
          item.description.toLowerCase().includes(filterText.toLowerCase()) ||
          item.id.toLowerCase().includes(filterText.toLowerCase());
        const price = Number(item.price);
        const min = minPrice ? Number(minPrice) : undefined;
        const max = maxPrice ? Number(maxPrice) : undefined;
        const matchesMin = min === undefined || price >= min;
        const matchesMax = max === undefined || price <= max;
      const matchesDept = !departmentFilter || (String(item.departmentId) === String(departmentFilter));
        return matchesText && matchesMin && matchesMax && matchesDept;
      })
    );
  }, [filterText, minPrice, maxPrice, departmentFilter, data]);

  return (
    <>
      <Row className="mb-3">
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Buscar por nome ou ID..."
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
          />
        </Col>
        <Col md={2}>
          <Form.Control
            type="number"
            placeholder="Preço mínimo"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
          />
        </Col>
        <Col md={2}>
          <Form.Control
            type="number"
            placeholder="Preço máximo"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}>
            <option value="">Todos os Departamentos</option>
              {[...new Set(data.map((item: Product) => item.departmentId).filter((n): n is string => !!n))].map(deptId => (
                <option key={deptId} value={deptId}>{deptId}</option>
              ))}
          </Form.Select>
        </Col>
        <Col md={2}>
          <button className="btn btn-success w-100" onClick={exportToCSV}>Exportar CSV</button>
        </Col>
      </Row>
      <DataTable
        title="Produtos"
        columns={columns}
        data={filteredData}
        pagination
        highlightOnHover
        striped
        responsive
      />
    </>
  );
};

export default ProductsDataTable;
