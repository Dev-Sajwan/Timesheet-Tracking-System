# Frontend Style Guidelines

## Design System

### Colors
- Primary: `#1976D2` (Blue)
- Secondary: `#FFC107` (Amber)
- Background: `#F5F5F5` (Light Gray)
- Surface: `#FFFFFF` (White)
- Text: `#212121` (Dark Gray)
- Text Secondary: `#757575` (Gray)
- Error: `#D32F2F` (Red)
- Success: `#388E3C` (Green)
- Warning: `#F57C00` (Orange)

### Typography
- Headings: Roboto Bold, 18px
- Subheadings: Roboto Medium, 16px
- Body: Roboto Regular, 14px

### Spacing
- 4px, 8px, 16px, 24px, 32px (8px grid system)

### Corners
- 6px radius for all rounded elements

### Shadows
- Sm: `0 1px 3px rgba(0,0,0,0.12)`
- Md: `0 2px 8px rgba(0,0,0,0.15)`
- Lg: `0 4px 16px rgba(0,0,0,0.18)`

## Components

### Button
- Primary: Solid fill with white text
- Secondary: Outline style
- All buttons open modal popup for API calls

### Modal/Popup
- All API action buttons (Edit, Delete, Assign Role, Reset Password) open a centered modal
- Title bar with action name
- Consistent typography and button styling
- Close button on top-right

### Table
- Alternating row colors: #FFFFFF / #FAFAFA
- Sticky header with bold text
- Hover highlight on rows

### Input
- Rounded corners
- Focus animation (border glow)

## File Structure
```
src/
  styles/
    designSystem.js      # Design tokens
    global.css          # Global styles
  components/
    Button.jsx           # Reusable button
    Modal.jsx            # Reusable modal
    Input.jsx            # Reusable input
  pages/
    Login.jsx            # Login page
    EmployeeDashboard.jsx
    ManagerDashboard.jsx
    AdminDashboard.jsx
  ...
```

## Usage Example
```javascript
import Button from '../components/Button';
import Modal from '../components/Modal';
import { designSystem } from '../styles/designSystem';

<Button onClick={handleClick}>Submit</Button>
<Modal isOpen={modalOpen} onClose={handleClose} title="Edit Employee">
  {/* form content */}
</Modal>
```