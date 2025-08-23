import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import DepartmentDetailsModal from '../Modals/DepartmentDetailsModal';
import DepartmentEditModal from '../Modals/DepartmentEditModal';
import DataTable, { TableColumn } from 'react-data-table-component';
import FormFeedback from '../Forms/FormFeedback';
import { FaFileCsv } from 'react-icons/fa';
import DepartmentFilters from '../Filters/DepartmentFilters';

export interface Department {
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
	const [deleting, setDeleting] = useState(false);
	const handleDelete = async () => {
		if (!selectedDepartment) return;
		if (!window.confirm('Tem certeza que deseja excluir este departamento?')) return;
		setDeleting(true);
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
				setDeleting(false);
				return;
			}
			setFilteredData((prev) => prev.filter((dep) => dep.id !== selectedDepartment.id));
			setFeedback({ type: 'success', message: 'Departamento excluído com sucesso!' });
			setLoading(false);
			setDeleting(false);
			// Fechar modal após mostrar feedback
			setTimeout(() => {
				setShowModal(false);
				setSelectedDepartment(null);
				setFeedback(null);
			}, 1500);
		} catch (err) {
			setFeedback({ type: 'danger', message: 'Erro ao excluir departamento' });
			setLoading(false);
			setDeleting(false);
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
				<>

					<DepartmentFilters
						filterText={filterText}
						onFilterTextChange={(e) => setFilterText(e.target.value)}
						onExportCSV={exportToCSV}
					/>
					{feedback && (
						<div style={{ position: 'fixed', top: 32, right: 32, zIndex: 9999, minWidth: 320 }}>
							<div
								className={`toast show animate__animated animate__fadeIn border-0 shadow-lg ${feedback.type === 'success' ? 'bg-success' : 'bg-danger'} text-white`}
								role="alert"
								aria-live="assertive"
								aria-atomic="true"
								style={{ fontSize: '1.1rem', borderRadius: 12 }}
							>
								<div className="toast-header bg-transparent border-0 text-white d-flex align-items-center">
									{feedback.type === 'success' && (
										<span className="me-2" style={{ fontSize: '1.5rem', color: '#fff' }}><i className="bi bi-check-circle-fill"></i></span>
									)}
									{feedback.type === 'danger' && (
										<span className="me-2" style={{ fontSize: '1.5rem', color: '#fff' }}><i className="bi bi-x-circle-fill"></i></span>
									)}
									<strong className="me-auto">
										{feedback.message}
									</strong>
									<button type="button" className="btn-close btn-close-white ms-2" onClick={() => setFeedback(null)}></button>
								</div>
							</div>
						</div>
					)}
					<div className="table-responsive rounded-3 border shadow-lg overflow-auto">
						<DataTable
							columns={columns}
							data={filteredData}
							pagination
							highlightOnHover
							striped
							responsive
							onRowClicked={handleRowClicked}
							customStyles={{
								rows: { style: { minHeight: '48px' } },
								headCells: { style: { fontWeight: 'bold', fontSize: '1rem' } },
							}}
						/>
					</div>
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
							deleting={deleting}
						/>
					) : null}
				</>
			);
};

export default DepartmentsDataTable;
