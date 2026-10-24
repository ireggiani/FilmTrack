import PropTypes from 'prop-types';
import AquaContextMenu from '../ui/AquaContextMenu';

// Small line icons for the clipboard row, drawn in the menu's text colour
const svgProps = {
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.3,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const CutIcon = () => (
  <svg {...svgProps}>
    <circle cx="4.5" cy="12" r="2" />
    <circle cx="11.5" cy="12" r="2" />
    <path d="M6 10.5 L11.5 2 M10 10.5 L4.5 2" />
  </svg>
);

const CopyIcon = () => (
  <svg {...svgProps}>
    <rect x="5.5" y="5.5" width="8" height="9" rx="1.5" />
    <path d="M10.5 3.5 V2.8 A1.3 1.3 0 0 0 9.2 1.5 H3.8 A1.3 1.3 0 0 0 2.5 2.8 V9.7 A1.3 1.3 0 0 0 3.8 11 H4.5" />
  </svg>
);

const PasteIcon = () => (
  <svg {...svgProps}>
    <rect x="3" y="3" width="10" height="11.5" rx="1.5" />
    <rect x="5.5" y="1.5" width="5" height="3" rx="1" fill="currentColor" fillOpacity="0.25" />
    <path d="M5.5 8.5 H10.5 M5.5 11 H9" />
  </svg>
);

const SelectAllIcon = () => (
  <svg {...svgProps}>
    <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" strokeDasharray="2 1.6" />
    <path d="M4.5 6 H11.5 M4.5 8.5 H11.5 M4.5 11 H8.5" />
  </svg>
);

const PARAGRAPH_STYLES = [
  ['p', 'Normal'],
  ['h1', 'Heading 1'],
  ['h2', 'Heading 2'],
  ['h3', 'Heading 3'],
];

// Right-click menu for the Notepad editor, built on AquaContextMenu.
// Notepad passes in its commands; every one runs on the selection that was
// current when the menu opened (Notepad restores it first).
const NotepadContextMenu = ({
  x,
  y,
  hasSelection,
  activeFormats,
  foreColors,
  hiliteColors,
  onCommand,
  onColor,
  onCut,
  onCopy,
  onPaste,
  onSelectAll,
  onToggleQuote,
  onSave,
  onClose,
}) => {
  const toggle = (command, label, icon) => ({
    key: command,
    label,
    icon,
    active: Boolean(activeFormats[command]),
    onSelect: () => onCommand(command),
  });

  const items = [
    {
      type: 'icons',
      items: [
        { key: 'cut', label: 'Cut (Ctrl+X)', icon: <CutIcon />, onSelect: onCut, disabled: !hasSelection },
        { key: 'copy', label: 'Copy (Ctrl+C)', icon: <CopyIcon />, onSelect: onCopy, disabled: !hasSelection },
        {
          key: 'paste',
          label: 'Paste as plain text — Ctrl+V keeps formatting',
          icon: <PasteIcon />,
          onSelect: onPaste,
        },
        { key: 'selectAll', label: 'Select all (Ctrl+A)', icon: <SelectAllIcon />, onSelect: onSelectAll },
      ],
    },
    {
      type: 'icons',
      items: [
        toggle('bold', 'Bold (Ctrl+B)', <b>B</b>),
        toggle('italic', 'Italic (Ctrl+I)', <i>I</i>),
        toggle('underline', 'Underline (Ctrl+U)', <u>U</u>),
        toggle('strikeThrough', 'Strikethrough', <s>S</s>),
        toggle('superscript', 'Superscript', <span>x²</span>),
        toggle('subscript', 'Subscript', <span>x₂</span>),
      ],
    },
    { type: 'separator' },
    {
      type: 'submenu',
      key: 'paragraph',
      label: 'Paragraph style',
      icon: '¶',
      items: PARAGRAPH_STYLES.map(([value, label]) => ({
        type: 'item',
        key: value,
        label,
        radio: true,
        checked: (activeFormats.block === 'blockquote' ? 'p' : activeFormats.block || 'p') === value,
        onSelect: () => onCommand('formatBlock', `<${value}>`),
      })),
    },
    {
      type: 'swatches',
      label: 'Text color',
      items: foreColors.map((c) => ({
        key: c.value,
        label: c.name,
        color: c.value,
        onSelect: () => onColor('foreColor', c.value),
      })),
    },
    {
      type: 'swatches',
      label: 'Highlight',
      items: hiliteColors.map((c) => ({
        key: c.value,
        label: c.name,
        color: c.value,
        onSelect: () => onColor('hiliteColor', c.value),
      })),
    },
    {
      type: 'item',
      key: 'bullets',
      label: 'Bullet list',
      icon: '•',
      checked: Boolean(activeFormats.insertUnorderedList) || undefined,
      onSelect: () => onCommand('insertUnorderedList'),
    },
    {
      type: 'item',
      key: 'numbers',
      label: 'Numbered list',
      icon: '1.',
      checked: Boolean(activeFormats.insertOrderedList) || undefined,
      onSelect: () => onCommand('insertOrderedList'),
    },
    {
      type: 'item',
      key: 'quote',
      label: 'Quote',
      icon: '❝',
      checked: activeFormats.block === 'blockquote' || undefined,
      onSelect: onToggleQuote,
    },
    { type: 'separator' },
    {
      type: 'item',
      key: 'clear',
      label: 'Clear formatting',
      icon: <span>T<sub>x</sub></span>,
      disabled: !hasSelection,
      onSelect: () => onCommand('removeFormat'),
    },
    {
      type: 'item',
      key: 'rule',
      label: 'Insert separator line',
      icon: '—',
      onSelect: () => onCommand('insertHorizontalRule'),
    },
    { type: 'separator' },
    { type: 'item', key: 'save', label: 'Save note', icon: '💾', shortcut: 'Ctrl+S', onSelect: onSave },
  ];

  return <AquaContextMenu x={x} y={y} items={items} onClose={onClose} label="Edit" />;
};

const colorShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
});

NotepadContextMenu.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  hasSelection: PropTypes.bool.isRequired,
  activeFormats: PropTypes.object.isRequired,
  foreColors: PropTypes.arrayOf(colorShape).isRequired,
  hiliteColors: PropTypes.arrayOf(colorShape).isRequired,
  onCommand: PropTypes.func.isRequired,
  onColor: PropTypes.func.isRequired,
  onCut: PropTypes.func.isRequired,
  onCopy: PropTypes.func.isRequired,
  onPaste: PropTypes.func.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  onToggleQuote: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default NotepadContextMenu;
