import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const ApprovalPending = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="inline-block text-primary mb-8"
        >
          <CheckCircle size={80} />
        </motion.div>
        <h1 className="text-3xl font-bold mb-4">Application Submitted!</h1>
        <p className="text-gray-600 text-lg">
          Your application will be reviewed and approved within 24 hours.
        </p>
      </motion.div>
    </div>
  );
};

export default ApprovalPending;