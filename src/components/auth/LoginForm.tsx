// import React from 'react';
// import { motion } from 'framer-motion';
// import { Mail, Lock, ArrowRight } from 'lucide-react';
// import InputField from '../ui/InputField';
// import Button from '../ui/Button';

// interface LoginFormProps {
//   email: string;
//   password: string;
//   onSubmit: (e: React.FormEvent) => void;
//   onChange: (field: string, value: string) => void;
// }

// const LoginForm: React.FC<LoginFormProps> = ({
//   email,
//   password,
//   onSubmit,
//   onChange,
// }) => {
//   return (
//     <motion.form
//       key="login"
//       initial={{ opacity: 0, x: 20 }}
//       animate={{ opacity: 1, x: 0 }}
//       exit={{ opacity: 0, x: -20 }}
//       onSubmit={onSubmit}
//       className="space-y-6"
//     >
//       <div className="text-center mb-8">
//         <h2 className="text-2xl font-bold text-gray-800">Login to Dashboard</h2>
//         <p className="text-gray-600 mt-2">Enter your credentials to continue</p>
//       </div>

//       <div className="space-y-4">
//         <InputField
//           label="Email Address"
//           id="email"
//           type="email"
//           placeholder="Enter your email"
//           value={email}
//           onChange={(e) => onChange('email', e.target.value)}
//           required
//           icon={<Mail size={20} />}
//         />

//         <InputField
//           label="Password"
//           id="password"
//           type="password"
//           placeholder="Enter your password"
//           value={password}
//           onChange={(e) => onChange('password', e.target.value)}
//           required
//           icon={<Lock size={20} />}
//         />
//       </div>

//       <Button type="submit" variant="primary" fullWidth rightIcon={<ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />}>
//         Login
//       </Button>
//     </motion.form>
//   );
// };

// export default LoginForm;



import React, { useRef, useEffect } from 'react'; // Added useRef, useEffect
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
  // --- START OF ADDITIONS FOR MOBILE KEYBOARD SCROLLING ---
  // Create refs for your input fields
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Directly embed the mobile keyboard scroll logic
  useEffect(() => {
    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      // Simple check for mobile screen size
      const isMobile = window.innerWidth <= 768; // Adjust breakpoint if necessary

      if (isMobile) {
        // Use requestAnimationFrame for smoother scrolling after keyboard appears
        requestAnimationFrame(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
    };

    // Attach event listeners to the input elements
    const emailElement = emailInputRef.current;
    const passwordElement = passwordInputRef.current;

    if (emailElement) {
      emailElement.addEventListener('focus', handleFocus);
    }
    if (passwordElement) {
      passwordElement.addEventListener('focus', handleFocus);
    }

    // Cleanup function to remove event listeners when component unmounts
    return () => {
      if (emailElement) {
        emailElement.removeEventListener('focus', handleFocus);
      }
      if (passwordElement) {
        passwordElement.removeEventListener('focus', handleFocus);
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount
  // --- END OF ADDITIONS FOR MOBILE KEYBOARD SCROLLING ---

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
          ref={emailInputRef}
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
          ref={passwordInputRef}
        />
      </div>

      <Button type="submit" variant="primary" fullWidth rightIcon={<ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />}>
        Login
      </Button>
    </motion.form>
  );
};

export default LoginForm;