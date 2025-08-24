import React from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { FaFileCsv } from 'react-icons/fa';
import { ProductFiltersProps } from '../../Interfaces/ProductFiltersProps';


const ProductFilters: React.FC<ProductFiltersProps> = ({
  filterText,
  minPrice,
  maxPrice,
  onFilterTextChange,
  onMinPriceChange,
  onMaxPriceChange,
  onExportCSV,
}) => (
  <Row className="g-3 mb-3 align-items-end">
    <Col xs={12} md={4}>
      <Form.Control
        type="text"
        placeholder="Nome ou código..."
        value={filterText}
        onChange={onFilterTextChange}
        className="shadow-sm"
      />
    </Col>
    <Col xs={12} md={3}>
      <Form.Control
        type="number"
        placeholder="Mínimo"
        value={minPrice}
        onChange={onMinPriceChange}
        className="shadow-sm"
      />
    </Col>
    <Col xs={12} md={3}>
      <Form.Control
        type="number"
        placeholder="Máximo"
        value={maxPrice}
        onChange={onMaxPriceChange}
        className="shadow-sm"
      />
    </Col>
    <Col xs={12} md={2} className="d-flex align-items-end">
      <Button
        variant="primary"
        className="w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm"
        onClick={onExportCSV}
        style={{ height: '40px' }}
      >
        <FaFileCsv /> Exportar
      </Button>
    </Col>
  </Row>
);

export default ProductFilters;
