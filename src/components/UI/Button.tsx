import React, { type CSSProperties } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  style?: CSSProperties;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  disabled = false,
  style,
  ...props
}) => (
  <button
    className={className + (disabled ? " opacity-50 pointer-events-none" : "")}
    disabled={disabled}
    style={{ ...style, cursor: "pointer" }}
    {...props}
  >
    {children}
  </button>
);

export default Button;
