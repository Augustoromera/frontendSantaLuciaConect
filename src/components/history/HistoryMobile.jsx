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
                <p className="mt-3 text-white-50 small">Un legado de servicio desde 1952</p>
            </div>

            {/* 3. CONTENT CONTAINER */}
            <div className="px-3 py-4">

                {/* CARD 1: 1952 */}
                <div style={cardStyle}>
                    <img src={img4} alt="1952" style={imgStyle} />
                    <div className="p-4">
                        <h3 className="h4 fw-bold text-primary">1952: La Visión</h3>
                        <p className="text-muted small mb-0 mt-3" style={{ lineHeight: '1.6' }}>
                            Todo comienza allá por el año <strong>1952</strong> cuando don <strong>Vicente Tripoloni</strong>, hijo de inmigrantes italianos, que llegaron con toda la fuerza y las ganas de trabajar en estas tierras y forjar un futuro para sus hijos, tuvo una visión: <span className="fst-italic text-dark">la de unir caminos y pueblos, conectar a la gente, profundizar las relaciones</span>, cosa que hasta ese momento era casi imposible.
                        </p>
                    </div>
                </div>

                {/* CARD 2: FIRST STEPS */}
                <div style={cardStyle}>
                    <img src={img3} alt="Primeros Pasos" style={imgStyle} />
                    <div className="p-4">
                        <h3 className="h4 fw-bold text-dark">Un Sueño en Marcha</h3>
                        <p className="text-muted small mb-0 mt-3" style={{ lineHeight: '1.6' }}>
                            Fue así como se dio comienzo a un sueño y con mucho sacrificio logró adquirir la primera unidad que recorría caminos cuando no polvorientos, abnegados por la lluvia y las inclemencias del tiempo, haciendo de mecánico y chofer a la vez.
                        </p>
                    </div>
                </div>

                {/* QUOTE BLOCK */}
                <div className="mb-4 p-4 text-center rounded-3 bg-primary text-white shadow-sm">
                    <p className="mb-0 fst-italic">"Fortaleciendo las relaciones y las instituciones de nuestro querido Monteros."</p>
                </div>

                {/* CARD 3: COMMUNITY */}
                <div style={cardStyle}>
                    <img src={img5} alt="Comunidad" style={imgStyle} />
                    <div className="p-4">
                        <p className="text-muted small mb-3" style={{ lineHeight: '1.6' }}>
                            De esta manera viajaban los pasajeros ya sea para sus trabajos, para estudiar o simplemente para visitar a sus familiares, fortaleciendo las relaciones y las instituciones de nuestro querido Monteros y zonas aledaña que estaban en pleno crecimiento.
                        </p>
                        <div style={{ borderLeft: '3px solid #ffc107', paddingLeft: '15px' }}>
                            <p className="small fw-semibold text-dark mb-0">
                                Esta vocación de prestar el servicio fue transmitida de generación en generación hasta llegar a sus hijos y nietos, que continuaron esta labor con todo orgullo y las fuerzas transmitidas e intactas para cumplir con el legado.
                            </p>
                        </div>
                    </div>
                </div>

                {/* LEGACY BLOCK */}
                <div className="text-center p-5 mb-5 bg-white rounded-3 shadow-sm" style={{ borderTop: '4px solid #ffc107' }}>
                    <h4 className="fw-bold mb-3 small text-uppercase ls-1">Hoy y Siempre</h4>
                    <p className="text-muted small mb-4">
                        Hoy, con mucho orgullo y sacrificio contamos con <strong>12 unidades habilitadas</strong> para cumplir con el recorrido de manera satisfactoria, pero no suficiente, pues mantenemos intacta las ansias de crecimiento y de cubrir las necesidades de nuestros pasajeros quienes son nuestro sostén en los momentos más difíciles que nos tocó atravesar al igual que nuestros choferes, que hicieron de esta empresa su familia.
                    </p>
                    <hr className="opacity-10 my-4" />
                    <p className="small fst-italic text-secondary mb-0">
                        "Es un honor para nosotros continuar con la tarea encomendada, conservando los valores y el espíritu de don Vicente Tripoloni."
                    </p>
                </div>

            </div>
        </div>
    );
};

export default HistoryMobile;
