import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Navbar, Nav } from 'react-bootstrap';
import ProductsDataTable from '../Components/Tables/ProductsDataTable';
import ProductForm from '../Components/Forms/ProductForm';
import { useNavigate } from 'react-router-dom';
import FeedbackToast from '../Components/Toasts/FeedbackToast';
import ProductModal from '../Components/Modals/ProductModal';

const Products: React.FC = () => {
	const [showModal, setShowModal] = useState(false);
	const [form, setForm] = useState({
		code: '',
		description: '',
		price: '',
		departmentId: ''
	});
	const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
	const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
	const [showToast, setShowToast] = useState(false);
	const [produtos, setProdutos] = useState<any[]>([]);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem('token');
		fetch('http://localhost:8080/api/produtos', {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => {
				if (res.status === 401) {
					localStorage.removeItem('token');
					navigate('/');
					return null;
				}
				return res.json();
			})
			.then((data) => {
				if (data?.error) {
					setError(data.error);
				} else if (data) {
					setProdutos(data);
				}
			});
	}, [navigate]);

	useEffect(() => {
		const token = localStorage.getItem('token');
		fetch('http://localhost:8080/api/departamentos', {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => res.json())
			.then((data) => {
				setDepartments(Array.isArray(data) ? data : []);
			})
			.catch(() => setDepartments([]));
	}, []);

	const handleOpenModal = () => setShowModal(true);
	const handleCloseModal = () => {
		setShowModal(false);
		setAlert(null);
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		if (e.target.name === 'price') {
			let value = e.target.value.replace(/\D/g, '');
			if (value.length === 0) {
				setForm({ ...form, price: '' });
				return;
			}
			while (value.length < 3) {
				value = '0' + value;
			}
			const cents = value.slice(-2);
			let intPart = value.slice(0, -2);
			intPart = intPart.replace(/^0+(?!$)/, '');
			if (intPart === '') intPart = '0';
			intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
			const masked = intPart + ',' + cents;
			setForm({ ...form, price: masked });
		} else {
			setForm({ ...form, [e.target.name]: e.target.value });
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setAlert(null);
		const token = localStorage.getItem('token');
		try {
			let priceValue = form.price.replace(/\./g, '');
			priceValue = priceValue.replace(/,/g, '.');
			const priceNumber = Number(priceValue);
			const response = await fetch('http://localhost:8080/api/produtos', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					code: form.code,
					description: form.description,
					price: priceNumber,
					departmentId: form.departmentId,
				}),
			});
			const result = await response.json();
			if (!response.ok) {
				let errorMsg = 'Erro ao cadastrar produto';
				if (result && result.error) {
					errorMsg = result.error;
				} else if (result && result.errors) {
					errorMsg = Object.values(result.errors).flat().join(' | ');
				} else if (result && result.message) {
					errorMsg = result.message;
				}
				setAlert({ type: 'danger', message: errorMsg });
				return;
			}
					setAlert({ type: 'success', message: 'Produto cadastrado com sucesso!' });
					setShowToast(true);
					setProdutos((prev) => [...prev, result]);
					setShowModal(false); // Fechar modal, não resetar form aqui
		} catch (err: any) {
			const msg = typeof err === 'string' ? err : err?.message || 'Erro desconhecido';
			setAlert({ type: 'danger', message: msg });
		}
	};

	const handleLogout = () => {
		localStorage.removeItem('token');
		navigate('/');
	};

	return (
		<>
			{error && <div className="alert alert-danger mt-5">{error}</div>}
			<FeedbackToast
				show={!!alert && showToast}
				type={alert?.type === 'success' ? 'success' : 'danger'}
				message={alert?.type === 'success' ? 'Produto cadastrado com sucesso!' : 'Ocorreu um erro ao cadastrar o produto.'}
				icon={alert?.type === 'success' ? <i className="bi bi-plus-circle-fill"></i> : <i className="bi bi-x-circle-fill"></i>}
				onClose={() => {
					setShowToast(false);
					setForm({ code: '', description: '', price: '', departmentId: '' }); // Resetar formulário aqui
				}}
			/>
			<Navbar bg="dark" variant="dark" fixed="top" expand="lg">
				<Container>
					<Navbar.Brand href="/home">Controle de Produtos</Navbar.Brand>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav">
						<Nav className="me-auto">
							<Nav.Link href="/usuarios">Usuários</Nav.Link>
							<Nav.Link href="/departamentos">Departamentos</Nav.Link>
							<Nav.Link href="/produtos">Produtos</Nav.Link>
						</Nav>
						<Button variant="outline-light" onClick={handleLogout}>
							Logout
						</Button>
					</Navbar.Collapse>
				</Container>
			</Navbar>
			<Container>
				<Row className="justify-content-md-center pt-3">
					<Col md={12}>
						<Card className="mt-4">
							<Card.Body className="p-4">
								<div className="d-flex justify-content-between align-items-center mb-3">
									<h3 className="mb-0">Produtos</h3>
									<Button
										variant="dark"
										onClick={handleOpenModal}
										style={{ minWidth: 180, fontWeight: 500 }}
									>
										<i className="bi bi-plus-lg" style={{ marginRight: 8 }}></i>
										Cadastrar Produto
									</Button>
								</div>
								<hr />
								<ProductsDataTable data={produtos} departments={departments} />
								<ProductModal
									show={showModal}
									onHide={handleCloseModal}
									onSubmit={handleSubmit}
									title="Cadastrar Produto"
														form={form}
														departments={departments}
														onChange={handleChange}
														alert={alert}
														loading={false}
														children={
															<ProductForm
																code={form.code}
																description={form.description}
																price={form.price}
																departmentId={form.departmentId}
																departments={departments}
																error={alert?.type === 'danger' ? alert.message : ''}
																onChange={handleChange}
																onSubmit={handleSubmit}
																onCancel={handleCloseModal}
															/>
														}
								/>
							</Card.Body>
						</Card>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default Products;
