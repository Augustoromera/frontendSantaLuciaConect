import React, { useState, useEffect, useRef } from 'react';
import './styles/CustomSelect.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

const CustomSelect = ({ options, value, onChange, placeholder, disabled, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (optionValue) => {
        if (disabled) return;
        onChange(optionValue);
        setIsOpen(false);
    };

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={`custom-select-container ${disabled ? 'disabled' : ''}`} ref={containerRef}>
            {label && <label className="custom-select-label">{label}</label>}

            <div
                className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className={`selected-text ${!selectedOption ? 'placeholder' : ''}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <FontAwesomeIcon icon={faChevronDown} className={`arrow-icon ${isOpen ? 'rotated' : ''}`} />
            </div>

            {isOpen && !disabled && (
                <div className="custom-select-options">
                    {options.length > 0 ? (
                        options.map((option) => (
                            <div
                                key={option.value}
                                className={`custom-option ${option.value === value ? 'selected' : ''}`}
                                onClick={() => handleSelect(option.value)}
                            >
                                {option.label}
                            </div>
                        ))
                    ) : (
                        <div className="custom-option no-results">No hay opciones</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
