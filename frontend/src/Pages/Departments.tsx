import React, { useEffect, useState } from 'react';
import { Container, Button, Navbar, Nav, Card, Row, Col } from 'react-bootstrap';
import FeedbackToast from '../Components/Toasts/FeedbackToast';
import DepartmentsDataTable, { Department } from '../Components/Tables/DepartmentsDataTable';
import DepartmentModal from '../Components/Modals/DepartmentModal';
import { useNavigate } from 'react-router-dom';

function Departments() {
	const [showModal, setShowModal] = useState(false);
	const [form, setForm] = useState({ name: '' });
	const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
	const [showToast, setShowToast] = useState(false);

	const handleOpenModal = () => setShowModal(true);
	const handleCloseModal = () => {
		setShowModal(false);
		setForm({ name: '' });
		setAlert(null);
	};
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setAlert(null);
		const token = localStorage.getItem('token');
		try {
			const response = await fetch('http://localhost:8080/api/departamentos', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ name: form.name }),
			});
			const result = await response.json();
			if (!response.ok) {
				let errorMsg = 'Erro ao cadastrar departamento';
				if (result && result.error) {
					errorMsg = result.error;
				}
				setAlert({ type: 'danger', message: errorMsg });
				setShowToast(true);
				return;
			}
			setAlert({ type: 'success', message: 'Departamento cadastrado com sucesso!' });
			setShowToast(true);
			setShowModal(false);
			setForm({ name: '' });
			// Atualiza lista sem reload
			setDepartamentos((prev) => [...prev, result]);
		} catch (err: any) {
			const msg = typeof err === 'string' ? err : err?.message || 'Erro desconhecido';
			setAlert({ type: 'danger', message: msg });
			setShowToast(true);
		}
	};

	const [departamentos, setDepartamentos] = useState<Department[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loadingDepartamentos, setLoadingDepartamentos] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem('token');
		setLoadingDepartamentos(true);
		fetch('http://localhost:8080/api/departamentos', {
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
					setDepartamentos(data);
				}
			})
			.finally(() => setLoadingDepartamentos(false));
	}, [navigate]);

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
				message={alert?.type === 'success' ? 'Departamento cadastrado com sucesso!' : alert?.message || 'Ocorreu um erro ao cadastrar o departamento.'}
				icon={alert?.type === 'success' ? <i className="bi bi-plus-circle-fill"></i> : <i className="bi bi-x-circle-fill"></i>}
				onClose={() => {
					setShowToast(false);
					setForm({ name: '' });
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
				<Row className="justify-content-md-center">
					<Col md={12}>
						<Card className="mt-4 shadow-sm rounded">
							<Card.Body>
								<div className="d-flex justify-content-between align-items-center mb-3">
									<h3 className="mb-0">Departamentos</h3>
									<Button
										variant="success"
										onClick={handleOpenModal}
										style={{ minWidth: 180, fontWeight: 500 }}
									>
										<i className="bi bi-plus-lg" style={{ marginRight: 8 }}></i>
										Cadastrar Departamento
									</Button>
								</div>
								<hr />
								{loadingDepartamentos ? (
									<div className="w-100 text-center my-5">
										<span className="spinner-border spinner-border-lg text-success" role="status" aria-hidden="true"></span>
										<div className="fw-bold mt-3">Carregando departamentos...</div>
									</div>
								) : (
									<DepartmentsDataTable data={departamentos} />
								)}
								<DepartmentModal
									show={showModal}
									onHide={handleCloseModal}
									title="Cadastrar Departamento"
									name={form.name}
									loading={false}
									onChangeName={(e) => setForm({ ...form, name: e.target.value })}
									onSave={handleSubmit}
								/>
							</Card.Body>
						</Card>
					</Col>
				</Row>
			</Container>
		</>
	);
}

export default Departments;
