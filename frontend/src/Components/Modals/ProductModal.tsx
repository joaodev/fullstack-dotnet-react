import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface ProductModalProps {
	show: boolean;
	onHide: () => void;
	onSubmit: (e: React.FormEvent) => void;
	title: string;
	form: {
		code: string;
		description: string;
		price: string;
		departmentId: string;
	};
	departments: { id: string; name: string }[];
	onChange: (e: React.ChangeEvent<any>) => void;
	loading?: boolean;
	alert?: { type: 'success' | 'danger'; message: string } | null;
	children?: React.ReactNode;
}

const ProductModal: React.FC<ProductModalProps> = ({
	show,
	onHide,
	onSubmit,
	title,
	form,
	departments,
	onChange,
	loading,
	alert,
	children,
}) => (
	<Modal show={show} onHide={onHide} centered dialogClassName="modal-lg">
		<Modal.Header closeButton className="border-0">
			<Modal.Title>{title}</Modal.Title>
		</Modal.Header>
		<Modal.Body>
			{children}
		</Modal.Body>
	</Modal>
);

export default ProductModal;
