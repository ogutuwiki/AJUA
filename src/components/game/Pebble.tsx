import React from 'react';
import { motion } from 'framer-motion';

interface PebbleProps {
  delay?: number;
  size?: 'sm' | 'default';
}

const Pebble: React.FC<PebbleProps> = ({ delay = 0, size = 'default' }) => {
  return (
    <motion.div
      className={size === 'sm' ? 'pebble-sm' : 'pebble'}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: delay * 0.05 }}
      aria-hidden="true"
    />
  );
};

export default Pebble;
