import GlassForm from './GlassForm';
import MetalForm from './MetalForm';
import PaperForm from './PaperForm';

// How a manager looks. The class names belong to the window themes in
// styles/windows/ (glass, paper, metal); each form has its own layout, so it
// is a component.
//
//   window/titlebar  classes for the frame and its title bar
//   button           added to every title-bar button
//   markActive       the maximize button gets "active" while maximized
//   Form             the add/edit form
//   errorPrefix      put before every form error
//   heading          class of the list's heading
//   filter           FilterInput's theme (none is glass)
//   sort             the Alphabetical toggle: 'checkbox' or 'led'
//   sortLabel        class for the checkbox's label
//   pill             class added to each pill
//   list             inline style for the pills' container
//   noMatch          inline style for "No … match"
const WHITE_NOTE = {
  color: 'rgba(255,255,255,0.5)',
  fontStyle: 'italic',
  fontSize: '0.8rem',
  padding: '0.25rem 0.5rem',
};

export const GLASS = {
  window: 'window',
  titlebar: 'window-titlebar',
  button: '',
  markActive: false,
  Form: GlassForm,
  errorPrefix: '',
  heading: 'heading-left',
  sort: 'checkbox',
  pill: 'glass',
  noMatch: WHITE_NOTE,
};

export const PAPER = {
  window: 'window--paper',
  titlebar: 'window-titlebar leather',
  button: ' brass-rivet',
  markActive: true,
  Form: PaperForm,
  errorPrefix: '🚫 Error: ',
  heading: 'heading-left--paper',
  filter: 'paper',
  sort: 'checkbox',
  sortLabel: 'paper',
  pill: 'paper',
  list: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  noMatch: { ...WHITE_NOTE, color: 'darkslategray', opacity: 0.7 },
};

export const METAL = {
  window: 'window--metal',
  titlebar: 'window-titlebar metal',
  button: ' paddle-switch',
  markActive: true,
  Form: MetalForm,
  errorPrefix: '🚫 Error: ',
  heading: 'heading-left--metal',
  filter: 'metal',
  sort: 'led',
  noMatch: WHITE_NOTE,
};
