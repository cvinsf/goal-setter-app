import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/utils';
import userEvent from '@testing-library/user-event';
import { Modal } from '../Modal';

describe('Modal', () => {
  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.queryByText(/modal content/i)).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByText(/modal content/i)).toBeInTheDocument();
  });

  it('displays title when provided', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByText(/test modal/i)).toBeInTheDocument();
  });

  it('renders close button by default', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByLabelText(/close modal/i)).toBeInTheDocument();
  });

  it('hides close button when showCloseButton is false', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} showCloseButton={false}>
        <p>Content</p>
      </Modal>
    );
    expect(screen.queryByLabelText(/close modal/i)).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>Content</p>
      </Modal>
    );

    await user.click(screen.getByLabelText(/close modal/i));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>Content</p>
      </Modal>
    );

    // Click on the backdrop (first child of the modal container)
    const backdrop = screen.getByText(/content/i).parentElement?.parentElement
      ?.previousSibling as HTMLElement;
    await user.click(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>Content</p>
      </Modal>
    );

    await user.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('applies small size class', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={vi.fn()} size="sm">
        <p>Content</p>
      </Modal>
    );
    expect(container.querySelector('.max-w-md')).toBeInTheDocument();
  });

  it('applies medium size class', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={vi.fn()} size="md">
        <p>Content</p>
      </Modal>
    );
    expect(container.querySelector('.max-w-lg')).toBeInTheDocument();
  });

  it('applies large size class', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={vi.fn()} size="lg">
        <p>Content</p>
      </Modal>
    );
    expect(container.querySelector('.max-w-2xl')).toBeInTheDocument();
  });

  it('applies extra large size class', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={vi.fn()} size="xl">
        <p>Content</p>
      </Modal>
    );
    expect(container.querySelector('.max-w-4xl')).toBeInTheDocument();
  });

  it('has correct ARIA attributes', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <p>Content</p>
      </Modal>
    );
    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('renders children correctly', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <div data-testid="child-content">
          <h2>Title</h2>
          <p>Paragraph</p>
        </div>
      </Modal>
    );
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText(/title/i)).toBeInTheDocument();
    expect(screen.getByText(/paragraph/i)).toBeInTheDocument();
  });
});
