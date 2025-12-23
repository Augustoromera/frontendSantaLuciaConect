import React from 'react';
import { Container } from 'react-bootstrap';
import img1 from '../../assets/images/unidades/unidad_nueva_1.png';
import img3 from '../../assets/images/unidades/unidad_nueva_3.jpg';
import img4 from '../../assets/images/unidades/unidad_nueva_4.jpg';
import img5 from '../../assets/images/unidades/unidad_nueva_5.jpg';

const HistoryMobile = () => {
    // Styles embedded here for maximum isolation/safety against external CSS
    const cardStyle = {
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #eee',
        marginBottom: '20px'
    };

    const imgStyle = {
        width: '100%',
        height: 'auto',
        aspectRatio: '16/9',
        objectFit: 'cover'
    };

    return (
        <div className="d-lg-none" style={{ backgroundColor: '#f5f5f5', }}>
            {/* 1. NAVBAR SPACER - Essential for visibility */}
            <div style={{ height: '80px', background: '#212529', width: '100%' }}></div>

            {/* 2. SIMPLE HEADER */}
            <div className="text-center text-white py-5 px-3" style={{ background: '#212529' }}>
                <h2 className="text-uppercase fw-bold mb-2">Nuestra Historia</h2>
                <div style={{ width: '40px', height: '3px', background: '#ffc107', margin: '0 auto' }}></div>
                <p className="mt-3 text-white-50 small">Desde 1952 uniendo a Monteros</p>
            </div>

            {/* 3. CONTENT CONTAINER */}
            <div className="px-3 py-4">

                {/* CARD 1: 1952 */}
                <div style={cardStyle}>
                    <img src={img4} alt="1952" style={imgStyle} />
                    <div className="p-4">
                        <h3 className="h4 fw-bold text-primary">1952: La Visión</h3>
                        <p className="text-muted small mb-0 mt-3" style={{ lineHeight: '1.6' }}>
                            Todo comienza con don <strong>Vicente Tripoloni</strong>. Él tuvo la visión de unir caminos y pueblos, conectando a la gente y profundizando relaciones en una época donde era casi imposible.
                        </p>
                    </div>
                </div>

                {/* CARD 2: FIRST STEPS */}
                <div style={cardStyle}>
                    <img src={img3} alt="Primeros Pasos" style={imgStyle} />
                    <div className="p-4">
                        <h3 className="h4 fw-bold text-dark">Un Sueño en Marcha</h3>
                        <p className="text-muted small mb-0 mt-3" style={{ lineHeight: '1.6' }}>
                            Con sacrificio adquirió su primera unidad. Recorría caminos de tierra y lluvia, haciendo de mecánico y chofer a la vez para cumplir con el servicio.
                        </p>
                    </div>
                </div>

                {/* QUOTE BLOCK */}
                <div className="mb-4 p-4 text-center rounded-3 bg-primary text-white shadow-sm">
                    <p className="mb-0 fst-italic">"Fortaleciendo las relaciones de nuestro querido Monteros."</p>
                </div>

                {/* CARD 3: COMMUNITY */}
                <div style={cardStyle}>
                    <img src={img5} alt="Comunidad" style={imgStyle} />
                    <div className="p-4">
                        <p className="text-muted small mb-3" style={{ lineHeight: '1.6' }}>
                            Así viajaban los pasajeros a sus trabajos y estudios, fortaleciendo el crecimiento de la zona y de las instituciones.
                        </p>
                        <div style={{ borderLeft: '3px solid #ffc107', paddingLeft: '15px' }}>
                            <p className="small fw-semibold text-dark mb-0">
                                Una vocación transmitida de generación en generación.
                            </p>
                        </div>
                    </div>
                </div>

                {/* LEGACY BLOCK */}
                <div className="text-center p-5 mb-5 bg-white rounded-3 shadow-sm" style={{ borderTop: '4px solid #ffc107' }}>
                    <h4 className="fw-bold mb-3 small text-uppercase ls-1">Hoy y Siempre</h4>
                    <p className="text-muted small mb-4">
                        Con <strong>12 unidades</strong> y el mismo orgullo de siempre. Gracias a nuestros pasajeros y choferes por ser parte de esta familia.
                    </p>
                    <hr className="opacity-10 my-4" />
                    <p className="small fst-italic text-secondary mb-0">
                        "El legado de don Vicente Tripoloni sigue intacto."
                    </p>
                </div>

            </div>
        </div>
    );
};

export default HistoryMobile;
