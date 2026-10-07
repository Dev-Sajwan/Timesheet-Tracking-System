import React from 'react';
import { designSystem, globalStyles } from '../styles/designSystem';

const sizeStyles = {
  small: { padding: `${designSystem.spacing.xs} ${designSystem.spacing.sm}`, fontSize: '13px', minHeight: '28px', gap: designSystem.spacing.xs },
  medium: { padding: `${designSystem.spacing.sm} ${designSystem.spacing.lg}`, fontSize: '14px', minHeight: '36px', gap: designSystem.spacing.sm },
  large: { padding: `${designSystem.spacing.md} ${designSystem.spacing.xl}`, fontSize: '15px', minHeight: '44px', gap: designSystem.spacing.sm },
};

const variantStyles = {
  primary: globalStyles.button.primary,
  secondary: globalStyles.button.secondary,
  subtle: globalStyles.button.subtle,
  danger: globalStyles.button.danger,
};

const Button = ({ children, variant = 'primary', onClick, disabled = false, type = 'button', style = {}, size = 'medium', fullWidth = false, startIcon, endIcon }) => {
  const baseStyle = variantStyles[variant] || variantStyles.primary;
  const sizing = sizeStyles[size] || sizeStyles.medium;

  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  const handleMouseDown = () => !disabled && setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => { setIsPressed(false); setIsHovered(false); };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{
        ...baseStyle,
        ...sizing,
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transform: isPressed && !disabled ? 'scale(0.98)' : isHovered && !disabled ? 'translateY(-1px)' : 'none',
        boxShadow: isPressed && !disabled ? designSystem.shadows.inset : isHovered && !disabled ? designSystem.shadows.elevation4 : baseStyle.boxShadow,
        background: isPressed && !disabled && variant === 'primary' ? designSystem.colors.primaryDark :
                    isHovered && !disabled && variant === 'primary' ? designSystem.colors.primaryHover :
                    isPressed && !disabled && variant === 'secondary' ? designSystem.colors.surfacePressed :
                    isHovered && !disabled && variant === 'secondary' ? designSystem.colors.surfaceHover :
                    isPressed && !disabled && variant === 'subtle' ? designSystem.colors.surfacePressed :
                    isHovered && !disabled && variant === 'subtle' ? designSystem.colors.surfaceHover :
                    isPressed && !disabled && variant === 'danger' ? designSystem.colors.error :
                    isHovered && !disabled && variant === 'danger' ? '#B42A01' :
                    baseStyle.background,
        borderColor: isHovered && !disabled && variant === 'secondary' ? designSystem.colors.primary : baseStyle.borderColor,
        color: (isHovered || isPressed) && !disabled && variant === 'secondary' ? designSystem.colors.primaryHover :
               (isHovered || isPressed) && !disabled && variant === 'subtle' ? designSystem.colors.text : baseStyle.color,
        transition: `all ${designSystem.transitions.fast}`,
        ...style,
      }}
      aria-disabled={disabled}
      aria-pressed={isPressed && !disabled}
    >
      {startIcon && <span style={{ display: 'flex', alignItems: 'center' }}>{startIcon}</span>}
      <span style={{ flex: 1, textAlign: 'center' }}>{children}</span>
      {endIcon && <span style={{ display: 'flex', alignItems: 'center' }}>{endIcon}</span>}
    </button>
  );
};

export default Button;