import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import DepartmentDetailsModal from '../Modals/DepartmentDetailsModal';
import DepartmentEditModal from '../Modals/DepartmentEditModal';
import DataTable, { TableColumn } from 'react-data-table-component';
import FormFeedback from '../Forms/FormFeedback';
import { FaFileCsv } from 'react-icons/fa';

interface Department {
	id: string;
	name: string;
}

interface DepartmentsDataTableProps {
	data: Department[];
}

const columns: TableColumn<Department>[] = [
	{
		name: 'ID',
		selector: (row) => row.id,
		sortable: true,
	},
	{
		name: 'Nome',
		selector: (row) => row.name,
		sortable: true,
	},
];

const DepartmentsDataTable: React.FC<DepartmentsDataTableProps> = ({ data }) => {
	// Função para fechar o modal
	const handleCloseModal = () => {
		setShowModal(false);
		setSelectedDepartment(null);
		setEditMode(false);
		setFeedback(null);
	};

	// Função para clique na linha
	const handleRowClicked = (row: Department) => {
		setSelectedDepartment(row);
		setShowModal(true);
		setEditMode(false);
		setFeedback(null);
	};

	// Função para deletar departamento
	const handleDelete = async () => {
		if (!selectedDepartment) return;
		if (!window.confirm('Tem certeza que deseja excluir este departamento?')) return;
		setLoading(true);
		setFeedback(null);
		const token = localStorage.getItem('token');
		try {
			const response = await fetch(`http://localhost:8080/api/departamentos/${selectedDepartment.id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			if (!response.ok) {
				setFeedback({ type: 'danger', message: 'Erro ao excluir departamento' });
				setLoading(false);
				return;
			}
			setFilteredData((prev) => prev.filter((dep) => dep.id !== selectedDepartment.id));
			setFeedback({ type: 'success', message: 'Departamento excluído com sucesso!' });
			setLoading(false);
			setTimeout(() => {
				setShowModal(false);
				setSelectedDepartment(null);
				setFeedback(null);
			}, 3000);
		} catch (err) {
			setFeedback({ type: 'danger', message: 'Erro ao excluir departamento' });
			setLoading(false);
		}
	};
	const [filterText, setFilterText] = useState('');
	const [filteredData, setFilteredData] = useState<Department[]>(data);
	const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [loading, setLoading] = useState(false);
	const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; message: string } | null>(
		null,
	);
	const [editMode, setEditMode] = useState(false);
	const [editName, setEditName] = useState('');

	useEffect(() => {
		setFilteredData(
			data.filter(
				(item: Department) =>
					item.name.toLowerCase().includes(filterText.toLowerCase()) ||
					item.id.toLowerCase().includes(filterText.toLowerCase()),
			),
		);
	}, [filterText, data]);

	const exportToCSV = () => {
		const csvRows = [];
		const headers = ['ID', 'Nome'];
		csvRows.push(headers.join(','));
		filteredData.forEach((item: Department) => {
			csvRows.push([item.id, item.name].join(','));
		});
		const csvContent = csvRows.join('\n');
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.setAttribute('download', 'departamentos.csv');
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	// Funções para editar e excluir (apenas exemplo, implementar integração depois)
	const handleEditClick = () => {
		if (!selectedDepartment) return;
		setEditName(selectedDepartment.name);
		setEditMode(true);
		setFeedback(null);
	};

  const handleEditSave = async () => {
    if (!selectedDepartment) return;
    if (!editName || editName === selectedDepartment.name) return;
    setLoading(true);
    setFeedback(null);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `http://localhost:8080/api/departamentos/${selectedDepartment.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: editName }),
        },
      );
      if (!response.ok) {
        setFeedback({ type: 'danger', message: 'Erro ao editar departamento' });
        setLoading(false);
        return;
      }
      setFilteredData((prev) =>
        prev.map((dep) => (dep.id === selectedDepartment.id ? { ...dep, name: editName } : dep)),
      );
      setFeedback({ type: 'success', message: 'Departamento editado com sucesso!' });
      setLoading(false);
      setTimeout(() => {
        setShowModal(false);
        setSelectedDepartment(null);
        setFeedback(null);
      }, 3000);
    } catch (err) {
      setFeedback({ type: 'danger', message: 'Erro ao editar departamento' });
      setLoading(false);
    }
  };

			return (
				<div className="card shadow-sm p-4 mb-4 animate__animated animate__fadeIn">
					<h2 className="mb-4 fw-bold">Departamentos</h2>
					<Row className="mb-3 align-items-end">
						<Col md={3}>
							<Form.Control
								type="text"
								placeholder="Nome ou ID..."
								value={filterText}
								onChange={(e) => setFilterText(e.target.value)}
							/>
						</Col>
						<Col md={2}>
							<Button variant="success" className="w-100 d-flex align-items-center gap-2" onClick={exportToCSV}>
								<FaFileCsv /> Exportar CSV
							</Button>
						</Col>
						{/* Espaço para botão de cadastro, se desejar adicionar */}
					</Row>
					{feedback && (
						<div className="mb-2">
							<FormFeedback type={feedback.type} message={feedback.message} />
						</div>
					)}
					<DataTable
						columns={columns}
						data={filteredData}
						pagination
						highlightOnHover
						striped
						responsive
						onRowClicked={handleRowClicked}
					/>
					{editMode && showModal ? (
						<DepartmentEditModal
							show={showModal}
							onHide={handleCloseModal}
							name={editName}
							loading={loading}
							onChangeName={(e) => setEditName(e.target.value)}
							onSave={handleEditSave}
						/>
					) : showModal ? (
						<DepartmentDetailsModal
							show={showModal}
							onHide={handleCloseModal}
							department={selectedDepartment}
							loading={loading}
							onEdit={handleEditClick}
							onDelete={handleDelete}
							deleting={false}
						/>
					) : null}
				</div>
			);
};

export default DepartmentsDataTable;
