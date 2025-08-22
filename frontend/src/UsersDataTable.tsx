import React, { useState, useEffect } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Form, Row, Col } from 'react-bootstrap';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UsersDataTableProps {
  data: User[];
}

const columns: TableColumn<User>[] = [
  {
    name: 'ID',
    selector: row => row.id,
    sortable: true,
  },
  {
    name: 'Nome',
    selector: row => row.name,
    sortable: true,
  },
  {
    name: 'Email',
    selector: row => row.email,
    sortable: true,
  },
];

const UsersDataTable: React.FC<UsersDataTableProps> = ({ data }) => {
  const [filterText, setFilterText] = useState('');
  const [filteredData, setFilteredData] = useState<User[]>(data);

  useEffect(() => {
    setFilteredData(
      data.filter((item: User) =>
        item.name.toLowerCase().includes(filterText.toLowerCase()) ||
        item.email.toLowerCase().includes(filterText.toLowerCase()) ||
        item.id.toLowerCase().includes(filterText.toLowerCase())
      )
    );
  }, [filterText, data]);

  const exportToCSV = () => {
    const csvRows = [];
    const headers = ['ID', 'Nome', 'Email'];
    csvRows.push(headers.join(','));
    filteredData.forEach((item: User) => {
      csvRows.push([item.id, item.name, item.email].join(','));
    });
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'usuarios.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Buscar por nome, email ou ID..."
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
          />
        </Col>
        <Col md={2}>
          <button className="btn btn-success w-100" onClick={exportToCSV}>Exportar CSV</button>
        </Col>
      </Row>
      <DataTable
        title="Usuários"
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

export default UsersDataTable;
