import React from 'react';
import { motion } from 'framer-motion';

const SectionTitle = ({
    title,
    subtitle,
    align = 'center',
    className = ''
}) => {
    return (
        <div className={`mb-12 ${align === 'center' ? 'text-center' : 'text-left'} ${className}`}>
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-gold font-bold tracking-widest uppercase text-sm mb-4"
            >
                {subtitle}
            </motion.p>
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-5xl font-display font-bold leading-tight"
            >
                {title}
            </motion.h2>
            <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: 80 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className={`h-1 bg-gold mt-6 ${align === 'center' ? 'mx-auto' : ''}`}
            />
        </div>
    );
};

export default SectionTitle;
