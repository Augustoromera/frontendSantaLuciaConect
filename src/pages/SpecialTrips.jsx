import React from 'react';
import Header from '../components/Header';
import { Footer } from '../components/Footer';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';

const SpecialTrips = () => {

    const handleConsultar = () => {
        Swal.fire({
            title: 'Solicitar Presupuesto',
            text: 'Para viajes especiales, por favor contáctanos directamente a nuestro WhatsApp o Email.',
            icon: 'info',
            confirmButtonText: 'Ir a Contacto'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '/contact';
            }
        });
    }

    return (
        <>
            <Header />
            <Container className="my-5" style={{ minHeight: '80vh' }}>
                <h1 className="text-center mb-5 display-4">Viajes Especiales</h1>
                <p className="text-center lead mb-5">
                    Ofrecemos servicios de transporte privado para eventos, turismo y empresas.
                    Consulta por nuestras unidades ejecutivas.
                </p>

                <Row>
                    <Col md={4} className="mb-4">
                        <Card className="h-100 shadow-sm hover-effect">
                            <Card.Img variant="top" src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop" style={{ height: '200px', objectFit: 'cover' }} />
                            <Card.Body>
                                <Card.Title>Turismo</Card.Title>
                                <Card.Text>
                                    Recorre los paisajes de Tucumán con la mayor comodidad.
                                    Ideales para excursiones escolares o grupos de jubilados.
                                </Card.Text>
                                <Button variant="primary" onClick={handleConsultar}>Consultar</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-4">
                        <Card className="h-100 shadow-sm hover-effect">
                            <Card.Img variant="top" src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1974&auto=format&fit=crop" style={{ height: '200px', objectFit: 'cover' }} />
                            <Card.Body>
                                <Card.Title>Eventos Empresariales</Card.Title>
                                <Card.Text>
                                    Traslado de personal, congresos y reuniones.
                                    Puntualidad y seriedad garantizada.
                                </Card.Text>
                                <Button variant="primary" onClick={handleConsultar}>Consultar</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-4">
                        <Card className="h-100 shadow-sm hover-effect">
                            <Card.Img variant="top" src="https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?q=80&w=2072&auto=format&fit=crop" style={{ height: '200px', objectFit: 'cover' }} />
                            <Card.Body>
                                <Card.Title>Eventos Sociales</Card.Title>
                                <Card.Text>
                                    Bodas, cumpleaños y fiestas privadas.
                                    Asegura el retorno seguro de tus invitados.
                                </Card.Text>
                                <Button variant="primary" onClick={handleConsultar}>Consultar</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <Footer />
        </>
    );
};

export default SpecialTrips;
