import React from 'react';
import Header from '../components/Header';
import { Footer } from '../components/Footer';
import HistoryDesktop from '../components/history/HistoryDesktop';
import HistoryMobile from '../components/history/HistoryMobile';
import './styles/history.css';

const HistoryScreen = () => {
    return (
        <>
            <Header navBarClass="navbar-solid" />
            <div className="history-page-container">
                <HistoryDesktop />
                <HistoryMobile />
            </div>
            <Footer />
        </>
    );
};

export default HistoryScreen;
