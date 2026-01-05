import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/utils';
import { ProgressBar } from '../ProgressBar';

describe('ProgressBar', () => {
  it('renders with default props', () => {
    render(<ProgressBar value={50} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays percentage label by default', () => {
    render(<ProgressBar value={75} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('hides percentage label when showLabel is false', () => {
    render(<ProgressBar value={75} showLabel={false} />);
    expect(screen.queryByText('75%')).not.toBeInTheDocument();
  });

  it('displays custom label', () => {
    render(<ProgressBar value={50} label="Progress" />);
    expect(screen.getByText('Progress')).toBeInTheDocument();
  });

  it('sets correct ARIA attributes', () => {
    render(<ProgressBar value={60} max={100} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '60');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('calculates percentage correctly with custom max', () => {
    render(<ProgressBar value={25} max={50} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('caps percentage at 100%', () => {
    render(<ProgressBar value={150} max={100} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('handles 0% progress', () => {
    render(<ProgressBar value={0} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('applies small size', () => {
    const { container } = render(<ProgressBar value={50} size="sm" />);
    const progressContainer = container.querySelector('.h-2');
    expect(progressContainer).toBeInTheDocument();
  });

  it('applies medium size', () => {
    const { container } = render(<ProgressBar value={50} size="md" />);
    const progressContainer = container.querySelector('.h-3');
    expect(progressContainer).toBeInTheDocument();
  });

  it('applies large size', () => {
    const { container } = render(<ProgressBar value={50} size="lg" />);
    const progressContainer = container.querySelector('.h-4');
    expect(progressContainer).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<ProgressBar value={50} className="custom-progress" />);
    expect(container.firstChild).toHaveClass('custom-progress');
  });

  it('applies animation by default', () => {
    const { container } = render(<ProgressBar value={50} />);
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveClass('animate-pulse-subtle');
  });

  it('removes animation when animated is false', () => {
    const { container } = render(<ProgressBar value={50} animated={false} />);
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).not.toHaveClass('animate-pulse-subtle');
  });

  it('sets correct width based on percentage', () => {
    const { container } = render(<ProgressBar value={75} />);
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveStyle({ width: '75%' });
  });

  it('applies success color for high progress', () => {
    const { container } = render(<ProgressBar value={100} />);
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveClass('bg-success');
  });

  it('applies warning color for medium progress', () => {
    const { container } = render(<ProgressBar value={50} />);
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveClass('bg-warning');
  });

  it('applies primary color for low progress', () => {
    const { container } = render(<ProgressBar value={20} />);
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveClass('bg-primary-400');
  });
});
