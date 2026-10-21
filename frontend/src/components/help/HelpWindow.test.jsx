import { Children, isValidElement } from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import HelpWindow from './HelpWindow';
import { TopicLink, OpenWindow } from './HelpElements';
import { TOPICS, TOC } from './helpContent';
import { WINDOW_MAP } from '../../config/windowRegistry';

jest.mock('react-draggable', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

const renderHelp = (props = {}) =>
  render(
    <HelpWindow
      isOpen
      onClose={jest.fn()}
      onMinimize={jest.fn()}
      onOpenWindow={jest.fn()}
      {...props}
    />
  );

const topicTitle = () => screen.getByRole('heading', { level: 1 });

// Tree entries are prefixed with a book/page icon, so match on the name's end
const treeItem = (label) =>
  within(screen.getByRole('navigation')).getByRole('button', {
    name: new RegExp(`${label}$`),
  });

// Every element of a given component type inside a topic body
const findElements = (node, type) => {
  if (!isValidElement(node)) return [];
  const own = node.type === type ? [node] : [];
  return own.concat(
    Children.toArray(node.props.children).flatMap((child) => findElements(child, type))
  );
};

describe('HelpWindow', () => {
  it('lists every topic in the Contents exactly once', () => {
    const tocIds = TOC.flatMap((entry) =>
      typeof entry === 'string' ? [entry] : entry.topics
    );
    expect([...tocIds].sort()).toEqual(Object.keys(TOPICS).sort());
  });

  it('only links to topics and windows that exist', () => {
    Object.values(TOPICS).forEach((topic) => {
      topic.related.forEach((id) => expect(TOPICS).toHaveProperty([id]));
      findElements(topic.body, TopicLink).forEach((link) =>
        expect(TOPICS).toHaveProperty([link.props.to])
      );
      findElements(topic.body, OpenWindow).forEach((button) =>
        expect(WINDOW_MAP).toHaveProperty([button.props.id])
      );
    });
  });

  it('renders every topic from the Contents tree', () => {
    renderHelp();
    // Open every book so all topics are clickable in the tree
    TOC.filter((entry) => typeof entry !== 'string').forEach(({ book }) => {
      const bookButton = treeItem(book);
      if (bookButton.getAttribute('aria-expanded') === 'false') {
        fireEvent.click(bookButton);
      }
    });

    Object.values(TOPICS).forEach((topic) => {
      fireEvent.click(treeItem(topic.title));
      expect(topicTitle()).toHaveTextContent(topic.title);
    });
  });

  it('navigates back and forward through history', () => {
    renderHelp();
    expect(topicTitle()).toHaveTextContent(TOPICS.welcome.title);
    fireEvent.click(treeItem(TOPICS.shortcuts.title));
    expect(topicTitle()).toHaveTextContent(TOPICS.shortcuts.title);
    fireEvent.click(screen.getByRole('button', { name: /Back/ }));
    expect(topicTitle()).toHaveTextContent(TOPICS.welcome.title);
    fireEvent.click(screen.getByRole('button', { name: /Forward/ }));
    expect(topicTitle()).toHaveTextContent(TOPICS.shortcuts.title);
  });

  it('finds topics from the Index by keyword', () => {
    renderHelp();
    fireEvent.click(screen.getByRole('tab', { name: 'Index' }));
    const input = screen.getByLabelText(/keyword to find/);
    fireEvent.change(input, { target: { value: 'esc' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(topicTitle()).toHaveTextContent(TOPICS.shortcuts.title);
  });

  it('opens app windows from launch buttons without refocusing Help', () => {
    const onOpenWindow = jest.fn();
    const onFocus = jest.fn();
    renderHelp({ onOpenWindow, onFocus });
    fireEvent.click(screen.getByRole('button', { name: /Open Movies Collection/ }));
    expect(onOpenWindow).toHaveBeenCalledWith('movies');
    expect(onFocus).not.toHaveBeenCalled();
  });
});
