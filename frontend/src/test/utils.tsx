import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';

// Test wrapper for components that need providers
interface WrapperProps {
  children: ReactNode;
}

function TestWrapper({ children }: WrapperProps) {
  return <>{children}</>;
}

// Custom render function
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: TestWrapper, ...options });
}

// Re-export everything
export * from '@testing-library/react';
export { renderWithProviders as render };
