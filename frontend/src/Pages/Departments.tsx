import React, { useEffect, useState } from 'react';
import { Container, Button, Navbar, Nav, Card, Row, Col } from 'react-bootstrap';
import DepartmentsDataTable from '../Components/Tables/DepartmentsDataTable';
import DepartmentModal from '../Components/Modals/DepartmentModal';
import { useNavigate } from 'react-router-dom';

function Departments() {
	const [showModal, setShowModal] = useState(false);
	const [form, setForm] = useState({ name: '' });
	const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

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
				return;
			}
			setAlert({ type: 'success', message: 'Departamento cadastrado com sucesso!' });
			setTimeout(() => {
				handleCloseModal();
				window.location.reload();
			}, 1200);
		} catch (err: any) {
			const msg = typeof err === 'string' ? err : err?.message || 'Erro desconhecido';
			setAlert({ type: 'danger', message: msg });
		}
	};
	const [departamentos, setDepartamentos] = useState([]);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem('token');
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
			});
	}, [navigate]);

	const handleLogout = () => {
		localStorage.removeItem('token');
		navigate('/');
	};

	return (
		<>
			<Button variant="primary" className="mb-3" onClick={handleOpenModal}>
				Cadastrar Departamento
			</Button>
			{error && <div className="alert alert-danger mt-5">{error}</div>}
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
						<Card className="mt-4">
							<Card.Body>
								<Card.Title>Departamentos</Card.Title>
								<DepartmentsDataTable data={departamentos} />
								{/* Modal de cadastro usando DepartmentModal */}
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
