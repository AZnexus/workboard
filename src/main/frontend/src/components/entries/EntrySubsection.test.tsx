import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EntrySubsection } from './EntrySubsection';

describe('EntrySubsection', () => {
  it('renders a regular subsection with title, count, and children', () => {
    render(
      <EntrySubsection title="Regular items" count={5} tone="regular">
        <div data-testid="child-content">Child</div>
      </EntrySubsection>
    );

    expect(screen.getByText('Regular items')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    
    // Should not render pin affordance
    const pinIcon = screen.queryByTestId('pin-icon');
    expect(pinIcon).not.toBeInTheDocument();
  });

  it('renders a fixed subsection with pin affordance and distinct styling', () => {
    const { container } = render(
      <EntrySubsection title="Fixades" count={2} tone="fixed">
        <div data-testid="child-content">Fixed Child</div>
      </EntrySubsection>
    );

    expect(screen.getByText('Fixades')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    
    // Should render pin affordance
    const pinIcon = screen.getByTestId('pin-icon');
    expect(pinIcon).toBeInTheDocument();

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('border-accent-primary/20');
  });
});
