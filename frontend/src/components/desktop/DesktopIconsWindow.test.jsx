import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DesktopIconsWindow from './DesktopIconsWindow';
import DesktopContextMenu from './DesktopContextMenu';

const windowProps = {
  isOpen: true,
  onClose: () => {},
  onMinimize: () => {},
  selectedIds: ['movies'],
  onChange: () => {},
};

describe('Desktop icon size', () => {
  it('shows the current size in the Desktop Icons window and reports a new one', () => {
    const onIconSizeChange = jest.fn();
    render(
      <DesktopIconsWindow {...windowProps} iconSize="medium" onIconSizeChange={onIconSizeChange} />
    );

    expect(screen.getByRole('radio', { name: 'Medium' })).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: 'Extra large' }));
    expect(onIconSizeChange).toHaveBeenCalledWith('xlarge');
  });

  it('offers the sizes in the desktop menu, which closes after a choice', () => {
    const onIconSizeChange = jest.fn();
    const onClose = jest.fn();
    render(
      <DesktopContextMenu
        x={0}
        y={0}
        sort="default"
        arrange="columns"
        iconSize="large"
        onSortChange={() => {}}
        onArrangeChange={() => {}}
        onIconSizeChange={onIconSizeChange}
        onNewNote={() => {}}
        onNewMovie={() => {}}
        onShowDesktop={() => {}}
        onOpenWindow={() => {}}
        onClose={onClose}
      />
    );

    expect(screen.getByRole('menuitemradio', { name: 'Large' })).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Small' }));
    expect(onIconSizeChange).toHaveBeenCalledWith('small');
    expect(onClose).toHaveBeenCalled();
  });
});
