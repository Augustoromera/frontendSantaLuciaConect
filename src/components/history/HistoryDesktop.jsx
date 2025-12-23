import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import img1 from '../../assets/images/unidades/unidad_nueva_1.png';
import img2 from '../../assets/images/unidades/unidad_nueva_2.png';
import img3 from '../../assets/images/unidades/unidad_nueva_3.jpg';
import img4 from '../../assets/images/unidades/unidad_nueva_4.jpg';
import img5 from '../../assets/images/unidades/unidad_nueva_5.jpg';
import img6 from '../../assets/images/unidades/unidad_nueva_6.jpg';

const HistoryDesktop = () => {
    return (
        <div className="d-none d-lg-block">
            {/* HERO SECTION DESKTOP */}
            <div className="hero-section text-center text-white d-flex align-items-center justify-content-center"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${img1})`,
                }}>
                <Container>
                    <h1 className="display-2 fw-bold text-uppercase mb-3">Nuestra Historia</h1>
                    <div style={{ width: '60px', height: '4px', background: '#ffc107', margin: '0 auto 20px' }}></div>
                    <p className="lead fs-3">Un legado de servicio desde 1952</p>
                </Container>
            </div>

            <div style={{ backgroundColor: '#f8f9fa' }}>
                {/* SECTION 1: 1952 */}
                <Container className="py-5">
                    <Row className="align-items-center py-5">
                        <Col lg={6} className="mb-4 mb-lg-0">
                            <img src={img4} alt="Inicios 1952" className="img-fluid rounded-3 shadow" />
                        </Col>
                        <Col lg={6} className="ps-lg-5">
                            <h2 className="display-6 fw-bold text-primary mb-3">1952: La Visión</h2>
                            <p className="text-muted fs-5 lh-lg">
                                Todo comienza allá por el año <strong>1952</strong> cuando don <strong>Vicente Tripoloni</strong>, hijo de inmigrantes italianos, que llegaron con toda la fuerza y las ganas de trabajar en estas tierras y forjar un futuro para sus hijos, tuvo una visión: <span className="fst-italic text-dark">la de unir caminos y pueblos, conectar a la gente, profundizar las relaciones</span>, cosa que hasta ese momento era casi imposible.
                            </p>
                        </Col>
                    </Row>
                    <hr className="my-5 text-muted opacity-25" />
                </Container>

                {/* SECTION 2: SUEÑO */}
                <Container className="py-5">
                    <Row className="align-items-center flex-row-reverse">
                        <Col lg={6} className="mb-4 mb-lg-0">
                            <img src={img3} alt="Primeros Pasos" className="img-fluid rounded-3 shadow" />
                        </Col>
                        <Col lg={6} className="pe-lg-5">
                            <h2 className="display-6 fw-bold text-dark mb-3">Un Sueño en Marcha</h2>
                            <p className="text-muted fs-5 lh-lg">
                                Fue así como se dio comienzo a un sueño y con mucho sacrificio logró adquirir la primera unidad que recorría caminos cuando no polvorientos, abnegados por la lluvia y las inclemencias del tiempo, haciendo de mecánico y chofer a la vez.
                            </p>
                        </Col>
                    </Row>
                </Container>

                {/* QUOTE BANNER DESKTOP */}
                <div className="py-5 text-center text-white my-5" style={{ backgroundColor: '#0d6efd' }}>
                    <Container className="py-3">
                        <blockquote className="blockquote mb-0 fs-3 fst-italic">
                            "Fortaleciendo las relaciones y las instituciones de nuestro querido Monteros."
                        </blockquote>
                    </Container>
                </div>

                {/* SECTION 3: COMMUNITY */}
                <Container className="py-5">
                    <Row className="align-items-center">
                        <Col lg={6} className="mb-4 mb-lg-0">
                            <img src={img5} alt="Comunidad" className="img-fluid rounded-3 shadow" />
                        </Col>
                        <Col lg={6} className="ps-lg-5">
                            <p className="text-muted fs-5 lh-lg mb-4">
                                De esta manera viajaban los pasajeros ya sea para sus trabajos, para estudiar o simplemente para visitar a sus familiares, fortaleciendo las relaciones y las instituciones de nuestro querido Monteros y zonas aledaña que estaban en pleno crecimiento.
                            </p>
                            <p className="text-dark fs-5 lh-lg border-start border-4 border-warning ps-4">
                                Esta vocación de prestar el servicio fue transmitida de generación en generación hasta llegar a sus hijos y nietos, que continuaron esta labor con todo orgullo y las fuerzas transmitidas e intactas para cumplir con el legado.
                            </p>
                        </Col>
                    </Row>
                    <hr className="my-5 text-muted opacity-25" />
                </Container>

                {/* SECTION 4: TODAY */}
                <Container className="py-5">
                    <Row className="justify-content-center text-center">
                        <Col lg={10}>
                            <h2 className="display-5 fw-bold text-primary mb-4">Hoy y Siempre</h2>
                            <p className="text-muted fs-5 lh-lg mb-0">
                                Hoy, con mucho orgullo y sacrificio contamos con <strong>12 unidades habilitadas</strong> para cumplir con el recorrido de manera satisfactoria, pero no suficiente, pues mantenemos intacta las ansias de crecimiento y de cubrir las necesidades de nuestros pasajeros quienes son nuestro sostén en los momentos más difíciles que nos tocó atravesar al igual que nuestros choferes, que hicieron de esta empresa su familia.
                            </p>
                        </Col>
                    </Row>
                </Container>

                {/* LEGACY BANNER DESKTOP */}
                <div className="py-5 mb-5 bg-dark text-white position-relative">
                    <Container className="position-relative z-2 py-4">
                        <div className="text-center mx-auto" style={{ maxWidth: '900px' }}>
                            <h3 className="display-6 fw-bold mb-4 font-monospace ls-1">EL LEGADO SIGUE INTACTO</h3>
                            <p className="fs-3 fw-light fst-italic mb-5">
                                "Es un honor para nosotros continuar con la tarea encomendada, conservando los valores y el espíritu de don Vicente Tripoloni."
                            </p>
                            <div className="d-flex align-items-center justify-content-center opacity-75">
                                <div style={{ width: '60px', height: '2px', background: '#ffc107' }} className="me-3"></div>
                                <span className="text-uppercase small ls-2 fw-bold">Familia Tripoloni</span>
                                <div style={{ width: '60px', height: '2px', background: '#ffc107' }} className="ms-3"></div>
                            </div>
                        </div>
                    </Container>
                    {/* Subtle background pattern */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'radial-gradient(circle at center, rgba(33,37,41,0) 0%, rgba(0,0,0,0.4) 100%)',
                        pointerEvents: 'none'
                    }}></div>
                </div>

                {/* GALLERY GRID (Desktop Only) */}
                <Container className="pb-5 mb-5">
                    <h3 className="text-center text-uppercase text-muted mb-5 ls-2">Nuestra Flota</h3>
                    <Row className="g-3">
                        {[img1, img2, img3, img4, img5, img6].map((img, i) => (
                            <Col md={4} sm={6} key={i}>
                                <div className="rounded-3 overflow-hidden shadow-sm h-100 bg-white fleet-card">
                                    <img src={img} alt={`Unidad ${i + 1}`} className="w-100 h-100 object-fit-cover" style={{ minHeight: '220px' }} />
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </div>
        </div>
    );
};

export default HistoryDesktop;
