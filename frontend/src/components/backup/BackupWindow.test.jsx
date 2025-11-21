import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BackupWindow from './BackupWindow';

// Mock Draggable
jest.mock('react-draggable', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

describe('BackupWindow', () => {
  const mockOnClose = jest.fn();
  const mockOnMinimize = jest.fn();
  const mockOnFocus = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        blob: () => Promise.resolve(new Blob(['test data'])),
      })
    );
    // Mock URL.createObjectURL and URL.revokeObjectURL
    window.URL.createObjectURL = jest.fn(() => 'mock-url');
    window.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    // Clean up mocks
    jest.restoreAllMocks();
  });

  it('renders correctly when open', () => {
    render(
      <BackupWindow
        isOpen={true}
        isMinimized={false}
        onClose={mockOnClose}
        onMinimize={mockOnMinimize}
        onFocus={mockOnFocus}
        zIndex={100}
      />
    );

    // Check for the title
    expect(screen.getByText('Backup & Restore')).toBeInTheDocument();

    // Check for buttons
    expect(screen.getByText('💽 Backup Database')).toBeInTheDocument();
    expect(screen.getByText('🧰 Restore Database')).toBeInTheDocument();
    expect(screen.getByText('Select File')).toBeInTheDocument();

    // Restore button should be disabled initially
    expect(screen.getByText('🧰 Restore Database')).toBeDisabled();
  });

  it('handles backup process correctly', async () => {
    const anchorClickMock = jest.fn();
    const removeMock = jest.fn();

    // Create a mock anchor element that is a real Node.
    const mockAnchor = document.createElement('a');
    jest.spyOn(mockAnchor, 'click').mockImplementation(anchorClickMock);
    jest.spyOn(mockAnchor, 'remove').mockImplementation(removeMock);

    // Save the original implementation before spying
    const originalCreateElement = document.createElement;
    const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return mockAnchor;
      }
      // For all other tags, call the original implementation to avoid recursion
      return originalCreateElement.call(document, tagName);
    });

    render(
      <BackupWindow
        isOpen={true}
        isMinimized={false}
        onClose={mockOnClose}
        onMinimize={mockOnMinimize}
        onFocus={mockOnFocus}
        zIndex={100}
      />
    );

    // Click the backup button
    fireEvent.click(screen.getByText('💽 Backup Database'));

    // Check for initial message
    expect(await screen.findByText('Starting backup...')).toBeInTheDocument();

    // Check that fetch was called
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/database/backup');

    // Wait for the success message
    await waitFor(() => {
      expect(screen.getByText('Backup downloaded successfully.')).toBeInTheDocument();
    });

    // Check that the download link was created and clicked
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(mockAnchor.download).toBe('filmtrack.backup.sqlite');
    expect(anchorClickMock).toHaveBeenCalled();
    expect(removeMock).toHaveBeenCalled();
    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');

    // Restore the spy
    createElementSpy.mockRestore();
  });

  it('does not render when closed', () => {
    const { container } = render(
      <BackupWindow
        isOpen={false}
        isMinimized={false}
        onClose={mockOnClose}
        onMinimize={mockOnMinimize}
        onFocus={mockOnFocus}
        zIndex={100}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when the close button is clicked', () => {
    render(
      <BackupWindow
        isOpen={true}
        isMinimized={false}
        onClose={mockOnClose}
        onMinimize={mockOnMinimize}
        onFocus={mockOnFocus}
        zIndex={100}
      />
    );

    fireEvent.click(screen.getByText('🗙'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onMinimize when the minimize button is clicked', () => {
    render(
      <BackupWindow
        isOpen={true}
        isMinimized={false}
        onClose={mockOnClose}
        onMinimize={mockOnMinimize}
        onFocus={mockOnFocus}
        zIndex={100}
      />
    );

    fireEvent.click(screen.getByText('🗕'));
    expect(mockOnMinimize).toHaveBeenCalledTimes(1);
  });
});
