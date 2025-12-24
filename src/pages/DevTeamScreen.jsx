import React from 'react';
import { Container, Badge } from 'react-bootstrap';
import { FaUserAstronaut, FaInstagram, FaFacebook, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import Header from '../components/Header';
import { Footer } from '../components/Footer';

import imgRomano from '../assets/images/team/romano_fernando.jpg';
import imgAugusto from '../assets/images/team/augusto_romera.jpg';
import imgMarcos from '../assets/images/team/marcos_brandan.jpg';

const DevTeamScreen = () => {
    const team = [
        {
            name: "Romano Luis Fernando",
            role: "Full Stack Developer",
            skills: ["SQL", "Firebase", "React", "Node.js", "HTML", "CSS", "JavaScript"],
            color: "#00f2ff", // Cyan
            image: imgRomano
        },
        {
            name: "Romano Emilse Milena",
            role: "UX/UI Designer",
            skills: ["UX/UI", "React", "CSS Animations", "Responsive"],
            color: "#bc13fe", // Purple
            image: null // No image yet
        },
        {
            name: "Brandan Marcos",
            role: "Backend Engineer",
            skills: ["Server Architecture", "API REST", "Security", "JavaScript"],
            color: "#00ff9d", // Green
            image: imgMarcos
        },
        {
            name: "Romera Rodriguez Augusto Efraín",
            role: "Full Stack Developer",
            skills: ["MySQL", "Database Design", "Data Analysis", "HTML", "CSS", "JavaScript"],
            color: "#ffc107", // Gold
            image: imgAugusto
        }
    ];

    return (
        <div className="dev-team-page">
            <Header />

            <div className="dev-content-wrapper">
                <div className="matrix-bg"></div>

                <Container className="main-container position-relative z-2">
                    <div className="header-section text-center fade-in-up">
                        <Badge bg="dark" className="faculty-badge border border-secondary rounded-pill text-uppercase">
                            Ingeniería en Sistemas de Información
                        </Badge>
                        <h1 className="main-title fw-bold text-white mb-2" data-text="DEV TEAM">DEV TEAM</h1>
                        <p className="subtitle text-white-50">UTN - Facultad Regional Tucumán</p>
                    </div>

                    <div className="team-grid">
                        {team.map((member, index) => (
                            <div className="team-card-wrapper" key={index}>
                                <div className="dev-card" style={{ '--accent-color': member.color }}>
                                    <div className="card-border"></div>
                                    <div className="card-content">
                                        <div className="avatar-container">
                                            <div className="avatar-ring"></div>
                                            {member.image ? (
                                                <img
                                                    src={member.image}
                                                    alt={member.name}
                                                    className="avatar-image"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        borderRadius: '50%',
                                                        position: 'relative',
                                                        zIndex: 2
                                                    }}
                                                />
                                            ) : (
                                                <FaUserAstronaut className="avatar-icon" />
                                            )}
                                        </div>

                                        <h3 className="member-name text-white">{member.name}</h3>
                                        <p className="member-role text-uppercase" style={{ color: member.color }}>{member.role}</p>

                                        <div className="skills-container">
                                            {member.skills.map((skill, i) => (
                                                <span key={i} className="skill-tag">{skill}</span>
                                            ))}
                                        </div>

                                        <div className="social-links-dev">
                                            <a href="#" className="social-link-dev" title="Instagram"><FaInstagram /></a>
                                            <a href="#" className="social-link-dev" title="Facebook"><FaFacebook /></a>
                                            <a href="#" className="social-link-dev" title="LinkedIn"><FaLinkedin /></a>
                                            <a href="#" className="social-link-dev" title="Email"><FaEnvelope /></a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Container>
            </div>

            <Footer />

            <style>{`
                /* === Mobile First Base Styles === */
                .dev-team-page {
                    min-height: 100vh;
                    background-color: #050505;
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    overflow-x: hidden;
                }
                
                .dev-content-wrapper {
                    flex: 1;
                    position: relative;
                    padding-top: 80px; /* Header space */
                    padding-bottom: 40px;
                    width: 100%;
                }

                .main-container {
                    padding-left: 15px;
                    padding-right: 15px;
                    max-width: 100%;
                }

                .matrix-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: transparent;
                    background-image: linear-gradient(to bottom right,
                            #000000 0%,
                            #1a1a1a 20%,
                            #0434a4b3 50%,
                            #1a1a1a 80%,
                            #000000 100%);
                    background-size: 300% 300%;
                    animation: movimiento 10s linear infinite alternate;
                    z-index: 0;
                    opacity: 0.6;
                }

                @keyframes movimiento {
                    from { background-position: 0% 0%; }
                    to { background-position: 100% 100%; }
                }

                /* Header Section */
                .header-section {
                    margin-bottom: 2rem;
                    padding: 0 10px;
                }

                .faculty-badge {
                    font-size: 0.7rem;
                    letter-spacing: 1px;
                    padding: 0.5em 1em;
                    white-space: normal;
                    line-height: 1.4;
                    margin-bottom: 1rem;
                    display: inline-block;
                }

                .main-title {
                    font-size: 2rem;
                    letter-spacing: 2px;
                    word-wrap: break-word; /* Prevent overflow */
                }

                .subtitle {
                    font-size: 0.9rem;
                }

                /* Grid Layout - Mobile Default (1 column) */
                .team-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .team-card-wrapper {
                    width: 100%;
                }

                /* Card Styles */
                .dev-card {
                    position: relative;
                    background: rgba(20, 20, 25, 0.8); /* Darker, less transparent for better mobile read */
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.05);
                    transition: transform 0.3s ease;
                    height: 100%; /* Ensure card takes full height of grid cell */
                }

                .card-border {
                    position: absolute;
                    inset: 0;
                    border-radius: 12px;
                    padding: 1px;
                    background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent 50%, var(--accent-color));
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    opacity: 0.3;
                }

                .card-content {
                    position: relative;
                    z-index: 1;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    height: 100%; /* Ensure content fills the card */
                }

                /* Avatar */
                .avatar-container {
                    position: relative;
                    width: 70px;
                    height: 70px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1rem;
                }

                .avatar-ring {
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                    border: 2px solid var(--accent-color);
                    opacity: 0.7;
                    box-shadow: 0 0 10px rgba(0,0,0,0.3);
                }

                .avatar-icon {
                    font-size: 1.8rem;
                    color: white;
                    z-index: 2;
                }

                /* Text Content */
                .member-name {
                    font-size: 1.1rem;
                    font-weight: bold;
                    margin-bottom: 0.3rem;
                }

                .member-role {
                    font-size: 0.8rem;
                    margin-bottom: 1rem;
                    letter-spacing: 0.5px;
                }

                /* Skills */
                .skills-container {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 6px;
                    margin-bottom: 1.5rem;
                }

                .skill-tag {
                    font-size: 0.75rem;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 3px 8px;
                    border-radius: 4px;
                    color: #aaa;
                }

                /* Social Links */
                .social-links-dev {
                    display: flex;
                    gap: 15px;
                    margin-top: auto;
                }

                .social-link-dev {
                    color: rgba(255,255,255,0.5);
                    font-size: 1.1rem;
                    transition: color 0.2s ease;
                }

                .social-link-dev:hover {
                    color: var(--accent-color);
                }

                /* Animation Classes */
                .fade-in-up {
                    animation: fadeInUp 0.6s ease-out forwards;
                }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* === Tablet / Small Desktop Styles (min-width: 768px) === */
                @media (min-width: 768px) {
                    .dev-content-wrapper {
                        padding-top: 100px;
                    }

                    .team-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 2rem;
                    }

                    .main-title {
                        font-size: 3rem;
                    }

                    .card-content {
                        padding: 2rem;
                    }

                    .avatar-container {
                        width: 90px;
                        height: 90px;
                    }
                    
                    .avatar-icon {
                        font-size: 2.5rem;
                    }

                    .member-name {
                        font-size: 1.25rem;
                    }

                    .dev-card:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    }
                    
                    .dev-card:hover .card-border {
                        opacity: 0.8;
                    }
                }

                /* === Large Desktop Styles (min-width: 992px) === */
                @media (min-width: 992px) {
                    .team-grid {
                        grid-template-columns: repeat(4, 1fr);
                        gap: 1.5rem;
                    }

                    .main-container {
                        max-width: 1400px; /* Allow wider spread */
                    }
                }
            `}</style>
        </div>
    );
};

export default DevTeamScreen;
