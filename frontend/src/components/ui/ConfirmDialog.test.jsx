import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfirmDialog from './ConfirmDialog';

const renderDialog = () => {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();
  render(
    <ConfirmDialog
      title="Delete Movie"
      heading="Delete “Akira”?"
      confirmLabel="Delete"
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      This can&apos;t be undone.
    </ConfirmDialog>
  );
  return { onConfirm, onCancel };
};

describe('ConfirmDialog', () => {
  it('starts with the confirm button focused', () => {
    renderDialog();
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Delete “Akira”?');
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus();
  });

  it('confirms on Enter', () => {
    const { onConfirm, onCancel } = renderDialog();
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('cancels on Escape', () => {
    const { onConfirm, onCancel } = renderDialog();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('Tab moves focus to Cancel, and Enter then cancels', () => {
    const { onConfirm, onCancel } = renderDialog();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('is not dismissed by clicking outside', () => {
    const { onConfirm, onCancel } = renderDialog();
    fireEvent.mouseDown(document.querySelector('.aero-dialog-backdrop'));
    expect(onCancel).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  describe('with an extra button', () => {
    const renderSavePrompt = () => {
      const onConfirm = jest.fn();
      const onExtra = jest.fn();
      const onCancel = jest.fn();
      render(
        <ConfirmDialog
          title="Notepad"
          heading="Save changes to “Ideas”?"
          confirmLabel="Save"
          extraLabel="Don't Save"
          onConfirm={onConfirm}
          onExtra={onExtra}
          onCancel={onCancel}
        />
      );
      return { onConfirm, onExtra, onCancel };
    };

    it('Tab cycles Save → Don\'t Save → Cancel → Save, Shift+Tab goes back', () => {
      renderSavePrompt();
      const save = screen.getByRole('button', { name: 'Save' });
      const dontSave = screen.getByRole('button', { name: "Don't Save" });
      const cancel = screen.getByRole('button', { name: 'Cancel' });
      expect(save).toHaveFocus();
      fireEvent.keyDown(window, { key: 'Tab' });
      expect(dontSave).toHaveFocus();
      fireEvent.keyDown(window, { key: 'Tab' });
      expect(cancel).toHaveFocus();
      fireEvent.keyDown(window, { key: 'Tab' });
      expect(save).toHaveFocus();
      fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
      expect(cancel).toHaveFocus();
    });

    it('Enter on the extra button calls onExtra only', () => {
      const { onConfirm, onExtra, onCancel } = renderSavePrompt();
      fireEvent.keyDown(window, { key: 'Tab' });
      fireEvent.keyDown(window, { key: 'Enter' });
      expect(onExtra).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
      expect(onCancel).not.toHaveBeenCalled();
    });
  });
});
