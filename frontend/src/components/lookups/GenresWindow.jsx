import LookupWindow from './LookupWindow';
import { GENRES } from './lookups';
import '../../styles/genres/_genre-form.scss';
import '../../styles/genres/_genre-list.scss';

const GenresWindow = (props) => <LookupWindow lookup={GENRES} {...props} />;

export default GenresWindow;
