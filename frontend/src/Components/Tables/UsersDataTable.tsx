import React, { useState, useEffect } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Form, Row, Col } from 'react-bootstrap';
import UserDetailsModal from '../Modals/UserDetailsModal';
import UserEditModal from '../Modals/UserEditModal';

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
		selector: (row) => row.id,
		sortable: true,
	},
	{
		name: 'Nome',
		selector: (row) => row.name,
		sortable: true,
	},
	{
		name: 'Email',
		selector: (row) => row.email,
		sortable: true,
	},
];

const UsersDataTable: React.FC<UsersDataTableProps> = ({ data }) => {
	const [filterText, setFilterText] = useState('');
	const [filteredData, setFilteredData] = useState<User[]>(data);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [loading, setLoading] = useState(false);
	const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
	const [editName, setEditName] = useState<string>('');
	const [editEmail, setEditEmail] = useState<string>('');
	const [editMode, setEditMode] = useState<boolean>(false);

	useEffect(() => {
		setFilteredData(
			data.filter(
				(item: User) =>
					item.name.toLowerCase().includes(filterText.toLowerCase()) ||
					item.email.toLowerCase().includes(filterText.toLowerCase()) ||
					item.id.toLowerCase().includes(filterText.toLowerCase()),
			),
		);
	}, [filterText, data]);

	const handleRowClicked = (row: User) => {
		setSelectedUser(row);
		setShowModal(true);
		setEditMode(false);
		setFeedback(null);
	};

	const handleEditClick = () => {
		if (!selectedUser) return;
		setEditName(selectedUser.name);
		setEditEmail(selectedUser.email);
		setEditMode(true);
		setFeedback(null);
	};

	const handleEditSave = async () => {
		if (!selectedUser) return;
		if (!editName || !editEmail) return;
		setLoading(true);
		setFeedback(null);
		const token = localStorage.getItem('token');
		try {
			const response = await fetch(
				`http://localhost:8080/api/usuarios/${selectedUser.id}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ name: editName, email: editEmail }),
				},
			);
			if (!response.ok) {
				setFeedback({ type: 'danger', message: 'Erro ao editar usuário' });
				setLoading(false);
				return;
			}
			setFilteredData((prev) =>
				prev.map((user) =>
					user.id === selectedUser.id ? { ...user, name: editName, email: editEmail } : user
				),
			);
			setFeedback({ type: 'success', message: 'Usuário editado com sucesso!' });
			setLoading(false);
			setTimeout(() => {
				setShowModal(false);
				setSelectedUser(null);
				setFeedback(null);
			}, 3000);
		} catch (err) {
			setFeedback({ type: 'danger', message: 'Erro ao editar usuário' });
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!selectedUser) return;
		if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
		setLoading(true);
		setFeedback(null);
		const token = localStorage.getItem('token');
		try {
			const response = await fetch(`http://localhost:8080/api/usuarios/${selectedUser?.id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			if (!response.ok) {
				setFeedback({ type: 'danger', message: 'Erro ao excluir usuário' });
				setLoading(false);
				return;
			}
			setFilteredData((prev) => prev.filter((user) => user.id !== selectedUser?.id));
			setFeedback({ type: 'success', message: 'Usuário excluído com sucesso!' });
			setLoading(false);
			setTimeout(() => {
				setShowModal(false);
				setSelectedUser(null);
				setFeedback(null);
			}, 3000);
		} catch (err) {
			setFeedback({ type: 'danger', message: 'Erro ao excluir usuário' });
			setLoading(false);
		}
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setSelectedUser(null);
		setEditMode(false);
		setFeedback(null);
	};

	const handleEditCancel = () => {
		setEditMode(false);
		setFeedback(null);
		if (!selectedUser) {
			setShowModal(false);
		}
	};

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
						onChange={(e) => setFilterText(e.target.value)}
					/>
				</Col>
				<Col md={2}>
					<button className="btn btn-success w-100" onClick={exportToCSV}>
						Exportar CSV
					</button>
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
				onRowClicked={handleRowClicked}
			/>

			{editMode && showModal && (
				<UserEditModal
					show={showModal}
					onHide={handleCloseModal}
					name={editName}
					email={editEmail}
					loading={loading}
					onChangeName={(e) => setEditName(e.target.value)}
					onChangeEmail={(e) => setEditEmail(e.target.value)}
					onSave={handleEditSave}
					onCancel={handleEditCancel}
				/>
			)}

			{!editMode && showModal && (
				<UserDetailsModal
					show={showModal}
					onHide={handleCloseModal}
					user={selectedUser}
					loading={loading}
					onEdit={handleEditClick}
					onDelete={handleDelete}
					deleting={false}
				/>
			)}
		</>
	);
};

export default UsersDataTable;


