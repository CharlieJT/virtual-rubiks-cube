import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  disabled = false,
  ...props
}) => (
  <button
    className={className + (disabled ? " opacity-50 pointer-events-none" : "")}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);

export default Button;
