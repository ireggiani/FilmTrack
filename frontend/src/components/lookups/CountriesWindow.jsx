import LookupWindow from './LookupWindow';
import { COUNTRIES } from './lookups';
import '../../styles/countries/_country-form.scss';
import '../../styles/countries/_country-list.scss';

// Brass rivet that shows and hides the form, pressed in while it's hidden
const formToggle = ({ shown, toggle }) => (
  <button
    className={`titlebar-button brass-rivet ${shown ? '' : 'active'}`}
    onClick={toggle}
    title={shown ? 'Hide Add Form' : 'Show Add Form'}
  >
    +
  </button>
);

const CountriesWindow = (props) => (
  <LookupWindow lookup={COUNTRIES} formToggle={formToggle} {...props} />
);

export default CountriesWindow;
