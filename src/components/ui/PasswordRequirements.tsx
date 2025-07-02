import React from 'react';

interface PasswordRequirementsProps {
  password: string;
  show: boolean;
}

const requirements = [
  {
    label: 'Enter at least 8 characters',
    test: (pw: string) => pw.length >= 8,
  },
  {
    label: 'Enter at least one uppercase letter',
    test: (pw: string) => /[A-Z]/.test(pw),
  },
  {
    label: 'Enter at least one lowercase letter',
    test: (pw: string) => /[a-z]/.test(pw),
  },
  {
    label: 'Enter at least one digit',
    test: (pw: string) => /[0-9]/.test(pw),
  },
  {
    label: 'Enter at least one special character (e.g., !, @, #, $)',
    test: (pw: string) => /[^a-zA-Z0-9]/.test(pw),
  },
];

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  show,
}) => {
  if (!show) return null;
  return (
    <ul className='text-xs mt-1 space-y-1'>
      {requirements.map((req, i) => {
        const met = req.test(password);
        return (
          <li key={i} className={met ? 'text-green-600' : 'text-red-500'}>
            {req.label}
          </li>
        );
      })}
    </ul>
  );
};
