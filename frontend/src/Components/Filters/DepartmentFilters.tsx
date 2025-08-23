import React from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { FaFileCsv } from 'react-icons/fa';

interface DepartmentFiltersProps {
  filterText: string;
  onFilterTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportCSV: () => void;
}

const DepartmentFilters: React.FC<DepartmentFiltersProps> = ({ filterText, onFilterTextChange, onExportCSV }) => (
  <Row className="g-3 mb-3 align-items-end">
    <Col xs={12} md={3}>
      <Form.Label className="fw-bold">Buscar</Form.Label>
      <Form.Control
        type="text"
        placeholder="Nome ou ID..."
        value={filterText}
        onChange={onFilterTextChange}
        className="shadow-sm"
      />
    </Col>
    <Col xs={12} md={2}>
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

export default DepartmentFilters;
