import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import DataTable, { TableColumn } from 'react-data-table-component';
import EditProductModal from '../Modals/EditProductModal';
import ProductDetailsModal from '../Modals/ProductDetailsModal';
import { FaFileCsv } from 'react-icons/fa';
import 'animate.css';

interface Product {
	id: string;
	code: string;
	description: string;
	price: number;
	departmentId?: string;
}

interface ProductsDataTableProps {
	data: Product[];
	onOpenModal?: () => void;
}

const columns: TableColumn<Product>[] = [
	{
		name: 'Código',
		selector: (row) => row.code,
		sortable: true,
	},
	{
		name: 'Nome',
		selector: (row) => row.description,
		sortable: true,
	},
	{
		name: 'Departamento',
		selector: (row) => row.departmentId || '',
		sortable: true,
	},
	{
		name: 'Preço',
		selector: (row) => row.price,
		sortable: true,
		right: true,
		cell: (row) =>
			Number(row.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
	},
];

const ProductsDataTable: React.FC<ProductsDataTableProps> = ({ data, onOpenModal }) => {
	const [filterText, setFilterText] = useState('');
	const [minPrice, setMinPrice] = useState('');
	const [maxPrice, setMaxPrice] = useState('');
	const [filteredData, setFilteredData] = useState<Product[]>(data);
	const [departmentFilter, setDepartmentFilter] = useState('');
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [loading, setLoading] = useState(false);
	const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; message: string } | null>(
		null,
	);
	const [editMode, setEditMode] = useState(false);
	const [editDescription, setEditDescription] = useState('');
	const [deleting, setDeleting] = useState(false);
	const [price, setPrice] = useState('');
	const [departmentId, setDepartmentId] = useState('');
		const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

		useEffect(() => {
			setFilteredData(
				data.filter((item: Product) => {
					const matchesText =
						item.description.toLowerCase().includes(filterText.toLowerCase()) ||
						item.code.toLowerCase().includes(filterText.toLowerCase());
					const price = Number(item.price);
					const min = minPrice ? Number(minPrice) : undefined;
					const max = maxPrice ? Number(maxPrice) : undefined;
					const matchesMin = min === undefined || price >= min;
					const matchesMax = max === undefined || price <= max;
					const matchesDept =
						!departmentFilter || String(item.departmentId) === String(departmentFilter);
					return matchesText && matchesMin && matchesMax && matchesDept;
				})
			);
		}, [filterText, minPrice, maxPrice, departmentFilter, data]);

		// Buscar departamentos ao abrir o modal de edição
			useEffect(() => {
				if (showModal && editMode) {
					const token = localStorage.getItem('token');
					fetch('http://localhost:8080/api/departamentos', {
						headers: { Authorization: `Bearer ${token}` },
					})
						.then((res) => res.json())
						.then((data) => setDepartments(Array.isArray(data) ? data : []))
						.catch(() => setDepartments([]));
				}
			}, [showModal, editMode]);

	const handleRowClicked = (row: Product) => {
		setSelectedProduct(row);
		setShowModal(true);
		setEditMode(false);
		setFeedback(null);
	};

	const handleEditClick = () => {
			if (!selectedProduct) return;
			setEditDescription(selectedProduct.description);
			// Formata o preço para BRL ao abrir o modal
			const priceValue = typeof selectedProduct.price === 'number'
				? selectedProduct.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
				: String(selectedProduct.price);
			setPrice(priceValue);
			setDepartmentId(selectedProduct.departmentId || '');
			setEditMode(true);
			setFeedback(null);
			setShowModal(true);
	};

		const [showToast, setShowToast] = useState(false);
		const [toastType, setToastType] = useState<'success' | 'error' | null>(null);

    function parseBRLToNumber(value: string) {
      // Remove tudo que não for número ou vírgula
      if (typeof value === 'number') return value;
      const cleaned = value.replace(/\./g, '').replace(',', '.');
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    }

		const handleEditSave = async () => {
			if (!selectedProduct) return;
			if (!editDescription || !price || !departmentId) return;
			setLoading(true);
			setFeedback(null);
			const token = localStorage.getItem('token');
			const priceNumber = parseBRLToNumber(price as string);
			try {
				const response = await fetch(`http://localhost:8080/api/produtos/${selectedProduct.id}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						id: selectedProduct.id,
						code: selectedProduct.code,
						description: editDescription,
						price: priceNumber,
						departmentId: departmentId
					}),
				});
				if (!response.ok) {
					setFeedback({ type: 'danger', message: 'Erro ao editar produto' });
					setToastType('error');
					setShowToast(true);
					setLoading(false);
					return;
				}
				setFilteredData((prev) =>
					prev.map((prod) =>
						prod.id === selectedProduct.id
							? { ...prod, description: editDescription, price: priceNumber, departmentId }
							: prod
					),
				);
				setFeedback({ type: 'success', message: 'Produto atualizado com sucesso!' });
				setToastType('success');
				setShowToast(true);
				setLoading(false);
				setTimeout(() => {
					setShowModal(false);
					setSelectedProduct(null);
					setEditMode(false);
					setShowToast(false);
				}, 1200);
			} catch (err) {
				setFeedback({ type: 'danger', message: 'Erro ao editar produto' });
				setToastType('error');
				setShowToast(true);
				setLoading(false);
			}
	};

	const handleEditCancel = () => {
		setEditMode(false);
		setFeedback(null);
		if (!selectedProduct) {
			setShowModal(false);
		}
	};

	const handleDelete = async () => {
		if (!selectedProduct) return;
		if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
		setDeleting(true);
		setLoading(true);
		setFeedback(null);
		const token = localStorage.getItem('token');
		try {
			const response = await fetch(`http://localhost:8080/api/produtos/${selectedProduct.id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			if (!response.ok) {
				setFeedback({ type: 'danger', message: 'Erro ao excluir produto' });
				setLoading(false);
				setDeleting(false);
				return;
			}
			setFilteredData((prev) => prev.filter((prod) => prod.id !== selectedProduct.id));
			setFeedback({ type: 'success', message: 'Produto excluído com sucesso!' });
			setLoading(false);
			setTimeout(() => {
				setShowModal(false);
				setSelectedProduct(null);
				setDeleting(false);
			}, 1200);
		} catch (err) {
			setFeedback({ type: 'danger', message: 'Erro ao excluir produto' });
			setLoading(false);
			setDeleting(false);
		}
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setSelectedProduct(null);
		setEditMode(false);
		setFeedback(null);
		setDeleting(false);
	};

	const exportToCSV = () => {
		const csvRows = [];
		const headers = ['Código', 'Nome', 'Departamento', 'Preço'];
		csvRows.push(headers.join(','));
		filteredData.forEach((item: Product) => {
			csvRows.push(
				[
					item.code,
					item.description,
					item.departmentId || '',
					Number(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
				].join(','),
			);
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

		return (
			<>
				{/* Toast flutuante de feedback */}
				<div style={{ position: 'fixed', top: 32, right: 32, zIndex: 9999, minWidth: 320 }}>
					{showToast && feedback && (
						<div
							className={`toast show animate__animated animate__fadeIn border-0 shadow-lg ${toastType === 'success' ? 'bg-success' : 'bg-danger'} text-white`}
							role="alert"
							aria-live="assertive"
							aria-atomic="true"
							style={{ fontSize: '1.1rem', borderRadius: 12 }}
						>
							<div className="toast-header bg-transparent border-0 text-white d-flex align-items-center">
								{toastType === 'success' && (
									<span className="me-2" style={{ fontSize: '1.5rem', color: '#fff' }}><i className="bi bi-check-circle-fill"></i></span>
								)}
								{toastType === 'error' && (
									<span className="me-2" style={{ fontSize: '1.5rem', color: '#fff' }}><i className="bi bi-x-circle-fill"></i></span>
								)}
								<strong className="me-auto">
									{feedback.message}
								</strong>
								<button type="button" className="btn-close btn-close-white ms-2" onClick={() => setShowToast(false)}></button>
							</div>
						</div>
					)}
				</div>
			<Row className="g-3 mb-3 align-items-end">
				<Col xs={12} md={3}>
					<Form.Label className="fw-bold">Buscar</Form.Label>
					<Form.Control
						type="text"
						placeholder="Nome ou código..."
						value={filterText}
						onChange={(e) => setFilterText(e.target.value)}
						className="shadow-sm"
					/>
				</Col>
				<Col xs={6} md={2}>
					<Form.Label className="fw-bold">Preço mínimo</Form.Label>
					<Form.Control
						type="number"
						placeholder="Mínimo"
						value={minPrice}
						onChange={(e) => setMinPrice(e.target.value)}
						className="shadow-sm"
					/>
				</Col>
				<Col xs={6} md={2}>
					<Form.Label className="fw-bold">Preço máximo</Form.Label>
					<Form.Control
						type="number"
						placeholder="Máximo"
						value={maxPrice}
						onChange={(e) => setMaxPrice(e.target.value)}
						className="shadow-sm"
					/>
				</Col>
				<Col xs={12} md={3}>
					<Form.Label className="fw-bold">Departamento</Form.Label>
					<Form.Select
						value={departmentFilter}
						onChange={(e) => setDepartmentFilter(e.target.value)}
						className="shadow-sm"
					>
						<option value="">Todos</option>
						{[
							...new Set(
								data.map((item: Product) => item.departmentId).filter((n): n is string => !!n),
							),
						].map((deptId) => (
							<option key={deptId} value={deptId}>
								{deptId}
							</option>
						))}
					</Form.Select>
				</Col>
				<Col xs={12} md={2}>
					<Button
						variant="success"
						className="w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm"
						onClick={exportToCSV}
					>
						<FaFileCsv /> Exportar CSV
					</Button>
				</Col>
			</Row>
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

			{editMode && showModal && (
				<EditProductModal
					show={showModal}
					onHide={handleCloseModal}
					title="Editar Produto"
					description={editDescription}
					price={price}
					departmentId={departmentId}
					departments={departments}
					loading={loading}
					onChangeDescription={(e) => setEditDescription(e.target.value)}
					onChangePrice={(e) => setPrice(e.target.value)}
					onChangeDepartment={(e) => setDepartmentId(e.target.value)}
					onSave={handleEditSave}
					onCancel={handleEditCancel}
				/>
			)}

			{!editMode && showModal && (
				<ProductDetailsModal
					show={showModal}
					onHide={handleCloseModal}
					product={
						selectedProduct
							? {
									...selectedProduct,
									departmentId: selectedProduct.departmentId || '',
							  }
							: null
					}
					loading={loading}
					onEdit={handleEditClick}
					onDelete={handleDelete}
					deleting={deleting}
				/>
			)}
		</>
	);
};

export default ProductsDataTable;
