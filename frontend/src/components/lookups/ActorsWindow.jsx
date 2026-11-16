import LookupWindow from './LookupWindow';
import { ACTORS } from './lookups';
import '../../styles/actors/_actor-form.scss';
import '../../styles/actors/_actor-list.scss';

const ActorsWindow = (props) => <LookupWindow lookup={ACTORS} {...props} />;

export default ActorsWindow;
