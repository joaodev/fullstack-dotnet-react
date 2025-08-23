import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import DataTable, { TableColumn } from 'react-data-table-component';
import EditProductModal from '../Modals/EditProductModal';
import ProductDetailsModal from '../Modals/ProductDetailsModal';
import ProductFilters from '../Filters/ProductFilters';
import { FaFileCsv } from 'react-icons/fa';
import 'animate.css';
import { updateProduct, deleteProduct } from '../../services/productService';

interface Product {
	id: string;
	code: string;
	description: string;
	price: number;
	departmentId?: string;
}

interface ProductsDataTableProps {
	data: Product[];
	departments: { id: string; name: string }[];
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
		selector: (row) => row.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
		sortable: true,
	}
];

const ProductsDataTable: React.FC<ProductsDataTableProps> = ({ data, departments, onOpenModal }) => {
	// State declarations must come before useEffect
	const [filterText, setFilterText] = useState('');
	const [minPrice, setMinPrice] = useState('');
	const [maxPrice, setMaxPrice] = useState('');
	const [departmentFilter, setDepartmentFilter] = useState('');
	const [showToast, setShowToast] = useState(false);
	const [toastType, setToastType] = useState<'success' | 'error'>('success');
	const [feedback, setFeedback] = useState<{ type: string; message: string } | null>(null);
	const [editMode, setEditMode] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [editDescription, setEditDescription] = useState('');
	const [price, setPrice] = useState('');
	const [departmentId, setDepartmentId] = useState('');
	const [loading, setLoading] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [filteredData, setFilteredData] = useState<Product[]>(data);

	useEffect(() => {
		let filtered = data;
		if (filterText.trim()) {
			const text = filterText.toLowerCase();
			filtered = filtered.filter(
				(item) =>
					item.description.toLowerCase().includes(text) ||
					item.code.toLowerCase().includes(text)
			);
		}
		if (minPrice.trim()) {
			const min = parseFloat(minPrice.replace(',', '.'));
			if (!isNaN(min)) {
				filtered = filtered.filter((item) => item.price >= min);
			}
		}
		if (maxPrice.trim()) {
			const max = parseFloat(maxPrice.replace(',', '.'));
			if (!isNaN(max)) {
				filtered = filtered.filter((item) => item.price <= max);
			}
		}
		if (departmentFilter) {
			filtered = filtered.filter((item) => item.departmentId === departmentFilter);
		}
		setFilteredData(filtered);
	}, [filterText, minPrice, maxPrice, departmentFilter, data]);

	const handleRowClicked = (row: Product) => {
		setSelectedProduct(row);
		setShowModal(true);
		setEditMode(false);
	};
	const handleEditSave = async () => {
		if (!selectedProduct) return;
		setLoading(true);
		setFeedback(null);
		const token = localStorage.getItem('token') || '';
		try {
			const updated = await updateProduct(token, {
				...selectedProduct,
				description: editDescription,
				price: parseFloat(price.replace(',', '.')),
				departmentId,
			});
			setFilteredData((prev) =>
				prev.map((prod) =>
					prod.id === selectedProduct.id
						? { ...prod, ...updated }
						: prod
				)
			);
			setFeedback({ type: 'success', message: 'Produto atualizado com sucesso!' });
			setToastType('success');
			setShowToast(true);
			setLoading(false);
			setTimeout(() => {
				setShowModal(false);
				setEditMode(false);
				setSelectedProduct(null);
			}, 1200);
		} catch (err) {
			setFeedback({ type: 'danger', message: 'Erro ao salvar produto' });
			setToastType('error');
			setShowToast(true);
			setLoading(false);
		}
	};
	const handleEditClick = () => {
		if (!selectedProduct) return;
		setEditDescription(selectedProduct.description);
		// Formata o preço para padrão brasileiro ao abrir o modal
		const formattedPrice = typeof selectedProduct.price === 'number'
			? selectedProduct.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
			: selectedProduct.price;
		setPrice(formattedPrice);
		setDepartmentId(selectedProduct.departmentId || '');
		setEditMode(true);
		setShowModal(true);
	};

	useEffect(() => {
		let filtered = data;
		if (filterText.trim()) {
			const text = filterText.toLowerCase();
			filtered = filtered.filter(
				(item) =>
					item.description.toLowerCase().includes(text) ||
					item.code.toLowerCase().includes(text)
			);
		}
		if (minPrice.trim()) {
			const min = parseFloat(minPrice.replace(',', '.'));
			if (!isNaN(min)) {
				filtered = filtered.filter((item) => item.price >= min);
			}
		}
		if (maxPrice.trim()) {
			const max = parseFloat(maxPrice.replace(',', '.'));
			if (!isNaN(max)) {
				filtered = filtered.filter((item) => item.price <= max);
			}
		}
		if (departmentFilter) {
			filtered = filtered.filter((item) => item.departmentId === departmentFilter);
		}
		setFilteredData(filtered);
	}, [filterText, minPrice, maxPrice, departmentFilter, data]);

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
		const token = localStorage.getItem('token') || '';
		try {
			await deleteProduct(token, selectedProduct.id);
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
				{showToast && feedback && (
					<div style={{ position: 'fixed', top: 32, right: 32, zIndex: 9999, minWidth: 320 }}>
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
					</div>
				)}
				<ProductFilters
					filterText={filterText}
					minPrice={minPrice}
					maxPrice={maxPrice}
					departmentFilter={departmentFilter}
					onFilterTextChange={(e) => setFilterText(e.target.value)}
					onMinPriceChange={(e) => setMinPrice(e.target.value)}
					onMaxPriceChange={(e) => setMaxPrice(e.target.value)}
					onDepartmentChange={(e) => setDepartmentFilter(e.target.value)}
					onExportCSV={exportToCSV}
					departments={departments.length ? departments : Array.from(new Set(data.map((item: Product) => item.departmentId).filter((n): n is string => !!n))).map((id: string) => ({ id, name: id }))}
				/>
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
