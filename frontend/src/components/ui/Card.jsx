import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
    children,
    className = '',
    hoverEffect = true
}) => {
    return (
        <motion.div
            whileHover={hoverEffect ? { y: -10, boxShadow: '0 25px 50px -12px rgba(212, 175, 55, 0.15)' } : {}}
            className={`glass-card p-8 rounded-2xl transition-all duration-300 ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default Card;
