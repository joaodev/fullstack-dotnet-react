import React from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { FaFileCsv } from 'react-icons/fa';
import { ProductFiltersProps } from '../../Interfaces/ProductFiltersProps';


const ProductFilters: React.FC<ProductFiltersProps> = ({
  filterText,
  minPrice,
  maxPrice,
  departmentFilter,
  onFilterTextChange,
  onMinPriceChange,
  onMaxPriceChange,
  onDepartmentChange,
  onExportCSV,
  departments,
}) => (
  <Row className="g-3 mb-3 align-items-end">
    <Col xs={12} md={3}>
      <Form.Label className="fw-bold">Buscar</Form.Label>
      <Form.Control
        type="text"
        placeholder="Nome ou código..."
        value={filterText}
        onChange={onFilterTextChange}
        className="shadow-sm"
      />
    </Col>
    <Col xs={6} md={2}>
      <Form.Label className="fw-bold">Preço mínimo</Form.Label>
      <Form.Control
        type="number"
        placeholder="Mínimo"
        value={minPrice}
        onChange={onMinPriceChange}
        className="shadow-sm"
      />
    </Col>
    <Col xs={6} md={2}>
      <Form.Label className="fw-bold">Preço máximo</Form.Label>
      <Form.Control
        type="number"
        placeholder="Máximo"
        value={maxPrice}
        onChange={onMaxPriceChange}
        className="shadow-sm"
      />
    </Col>
    <Col xs={12} md={3}>
      <Form.Label className="fw-bold">Departamento</Form.Label>
      <Form.Select
        value={departmentFilter}
        onChange={onDepartmentChange}
        className="shadow-sm"
      >
        <option value="">Todos</option>
        {departments.map((dept) => (
          <option key={dept.id} value={dept.id}>
            {dept.name}
          </option>
        ))}
      </Form.Select>
    </Col>
    <Col xs={12} md={2}>
      <Form.Label className="fw-bold" style={{ visibility: 'hidden' }}>Exportar</Form.Label>
      <Button
        variant="primary"
        className="w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm"
        onClick={onExportCSV}
      >
        <FaFileCsv /> Exportar CSV
      </Button>
    </Col>
  </Row>
);

export default ProductFilters;
