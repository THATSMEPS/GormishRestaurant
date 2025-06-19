// import React from 'react';

// interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
//   label: string;
//   icon?: React.ReactNode;
//   error?: string;
//   multiline?: boolean;
// }

// const InputField: React.FC<InputFieldProps> = ({
//   label,
//   icon,
//   error,
//   multiline = false,
//   className = '',
//   ...props
// }) => {
//   const inputClassName = `input-field ${error ? 'border-red-500' : ''} ${className}`;
  
//   return (
//     <div>
//       <label className="form-label" htmlFor={props.id}>
//         {label}
//       </label>
//       <div className="input-group">
//         {icon && <div className="input-group-icon">{icon}</div>}
//         {multiline ? (
//           <textarea
//             {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
//             className={`${inputClassName} min-h-[80px]`}
//           />
//         ) : (
//           <input
//             {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
//             className={inputClassName}
//           />
//         )}
//       </div>
//       {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
//     </div>
//   );
// };

// export default InputField;



import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  multiline?: boolean;
}

// *** CRITICAL CHANGE: Use React.forwardRef to pass refs to the DOM elements ***
const InputField = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputFieldProps>(
  ({
    label,
    icon,
    error,
    multiline = false,
    className = '',
    ...props
  }, ref) => { // 'ref' is the forwarded ref from the parent component
    const inputClassName = `input-field ${error ? 'border-red-500' : ''} ${className}`;

    return (
      <div>
        <label className="form-label" htmlFor={props.id}>
          {label}
        </label>
        <div className="input-group">
          {icon && <div className="input-group-icon">{icon}</div>}
          {multiline ? (
            <textarea
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
              className={`${inputClassName} min-h-[80px]`}
              ref={ref as React.Ref<HTMLTextAreaElement>} // Attach the forwarded ref to the textarea
            />
          ) : (
            <input
              {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
              className={inputClassName}
              ref={ref as React.Ref<HTMLInputElement>} // Attach the forwarded ref to the input
            />
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

export default InputField;