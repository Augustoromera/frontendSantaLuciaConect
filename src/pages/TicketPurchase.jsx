import React, { useState } from 'react';
import Header from '../components/Header';
import { Footer } from '../components/Footer';
import { Container, Row, Col, Card, Button, Form, Badge } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/config';

const TicketPurchase = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [abonoType, setAbonoType] = useState('mensual');
    const [quantity, setQuantity] = useState(1);

    const precios = {
        'mensual': 25000,
        'quincenal': 15000,
        'estudiantil': 12000
    };

    const handlePurchase = async () => {
        if (!isAuthenticated) {
            Swal.fire({
                title: 'Inicia Sesión',
                text: 'Debes estar registrado para comprar abonos.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ir a Login',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) navigate('/login');
            });
            return;
        }

        const total = precios[abonoType] * quantity;

        const confirm = await Swal.fire({
            title: 'Confirmar Pedido',
            html: `
                <p>Estás solicitando: <strong>${abonoType.toUpperCase()}</strong></p>
                <p>Cantidad: <strong>${quantity}</strong></p>
                <p class="display-6">Total: $${total}</p>
                <small>El pago se coordina en boletería.</small>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Confirmar Pedido'
        });

        if (confirm.isConfirmed) {
            try {
                await addDoc(collection(db, "orders"), {
                    userId: user.uid,
                    userName: user.username || user.email,
                    type: abonoType,
                    quantity: parseInt(quantity),
                    total: total,
                    status: 'pendiente', // pendiente, pagado, entregado
                    createdAt: new Date().toISOString()
                });

                Swal.fire('Éxito', 'Tu pedido de abono ha sido registrado. Pasa por boletería para pagar y retirar.', 'success');
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'No se pudo procesar el pedido.', 'error');
            }
        }
    };

    return (
        <>
            <Header />
            <Container className="my-5" style={{ minHeight: '80vh' }}>
                <h1 className="text-center mb-5 display-4">Compra de Abonos</h1>

                <Row className="justify-content-center">
                    <Col md={6}>
                        <Card className="shadow-lg border-0">
                            <Card.Header className="bg-primary text-white text-center py-3">
                                <h3 className="mb-0">Solicitud de Abono</h3>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Tipo de Abono</Form.Label>
                                        <Form.Select
                                            value={abonoType}
                                            onChange={(e) => setAbonoType(e.target.value)}
                                            size="lg"
                                        >
                                            <option value="mensual">Abono Mensual (Común)</option>
                                            <option value="quincenal">Abono Quincenal</option>
                                            <option value="estudiantil">Boleto Estudiantil</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label>Cantidad</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="1"
                                            max="5"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            size="lg"
                                        />
                                    </Form.Group>

                                    <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded">
                                        <h5 className="mb-0">Total Estimado:</h5>
                                        <h3 className="mb-0 text-primary">${precios[abonoType] * quantity}</h3>
                                    </div>

                                    <div className="d-grid">
                                        <Button variant="success" size="lg" onClick={handlePurchase}>
                                            Realizar Pedido
                                        </Button>
                                    </div>
                                    <div className="text-center mt-3 text-muted">
                                        <small>Los abonos se retiran en terminal de ómnibus.</small>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={4}>
                        <Card className="shadow-sm mb-3">
                            <Card.Body>
                                <Card.Title>Abono Mensual</Card.Title>
                                <Card.Text>Viajes ilimitados por 30 días. Ideal para trabajadores diarios.</Card.Text>
                                <Badge bg="primary">$25,000</Badge>
                            </Card.Body>
                        </Card>
                        <Card className="shadow-sm mb-3">
                            <Card.Body>
                                <Card.Title>Abono Quincenal</Card.Title>
                                <Card.Text>Viajes ilimitados por 15 días.</Card.Text>
                                <Badge bg="info">$15,000</Badge>
                            </Card.Body>
                        </Card>
                        <Card className="shadow-sm mb-3">
                            <Card.Body>
                                <Card.Title>Estudiantil</Card.Title>
                                <Card.Text>Descuento especial para alumnos regulares. Requiere certificado.</Card.Text>
                                <Badge bg="warning" text="dark">$12,000</Badge>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <Footer />
        </>
    );
};

export default TicketPurchase;
