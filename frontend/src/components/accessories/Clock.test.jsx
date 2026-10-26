import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Clock from './Clock';

describe('Clock', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 9, 26, 14, 32, 7));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows 24-hour time in the title bar and switches to 12-hour from the face menu', () => {
    const { container } = render(
      <Clock isOpen onClose={() => {}} onMinimize={() => {}} />
    );

    expect(screen.getByText('14:32:07')).toBeInTheDocument();

    fireEvent.contextMenu(container.querySelector('.clock-content'));
    fireEvent.click(screen.getByRole('menuitemradio', { name: /12-hour time/ }));

    expect(screen.getByText('02:32:07 PM')).toBeInTheDocument();
  });
});
