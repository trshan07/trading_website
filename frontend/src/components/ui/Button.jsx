import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
    children,
    variant = 'gold',
    className = '',
    onClick,
    type = 'button'
}) => {
    const variants = {
        gold: 'btn-gold',
        outline: 'btn-outline',
        ghost: 'text-white/70 hover:text-white transition-colors',
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type={type}
            onClick={onClick}
            className={`${variants[variant]} ${className}`}
        >
            {children}
        </motion.button>
    );
};

export default Button;
