import { render, screen, fireEvent } from '@testing-library/react';
import StartButton from './StartButton';
import '@testing-library/jest-dom';

describe('StartButton', () => {
  it('renders the button and calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<StartButton onClick={handleClick} />);

    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toBeInTheDocument();

    fireEvent.click(buttonElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
