import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import InputField from '../ui/InputField';
import Button from '../ui/Button';

interface LoginFormProps {
  email: string;
  password: string;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: string, value: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  password,
  onSubmit,
  onChange,
}) => {
  return (
    <motion.form
      key="login"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={onSubmit}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Login to Dashboard</h2>
        <p className="text-gray-600 mt-2">Enter your credentials to continue</p>
      </div>

      <div className="space-y-4">
        <InputField
          label="Email Address"
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => onChange('email', e.target.value)}
          required
          icon={<Mail size={20} />}
        />

        <InputField
          label="Password"
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => onChange('password', e.target.value)}
          required
          icon={<Lock size={20} />}
        />
      </div>

      <Button type="submit" variant="primary" fullWidth rightIcon={<ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />}>
        Login
      </Button>
    </motion.form>
  );
};

export default LoginForm;
