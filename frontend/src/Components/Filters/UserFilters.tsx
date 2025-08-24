import React from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { FaFileCsv } from 'react-icons/fa';

interface UserFiltersProps {
  filterText: string;
  onFilterTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportCSV: () => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({ filterText, onFilterTextChange, onExportCSV }) => (
  <Row className="g-3 mb-3 align-items-end">
    <Col xs={12} md={10}>
      <Form.Control
        type="text"
        placeholder="Pesquise por Nome ou email..."
        value={filterText}
        onChange={onFilterTextChange}
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

export default UserFilters;
