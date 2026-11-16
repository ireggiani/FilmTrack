import PropTypes from 'prop-types';
import { useLookupForm } from './useLookupForm';

const MetalForm = ({ lookup, editing, onDone, hidden }) => {
  const form = useLookupForm(lookup, editing, onDone);

  return (
    <form className={`${lookup.noun}-form${hidden ? ' hide' : ''}`} onSubmit={form.submit}>
      <h2 className="heading-centre--metal">{form.heading}</h2>

      {lookup.fields.map((field) => (
        <div className="form-group" key={field.key}>
          <input {...form.input(field)} aria-label={field.label} />
        </div>
      ))}
      {/* A control strip that fits its buttons: secondary (Cancel Edit, only
          while editing) to the left of the primary submit button */}
      <div className="buttons">
        {form.error && <p className="error">{form.error}</p>}
        <div className="buttons-inner">
          {form.isEditing && (
            <button type="button" onClick={form.cancel} className="btn--metal">
              ← Cancel Edit
            </button>
          )}
          <button type="submit" className="btn--metal submit" disabled={!form.canSubmit}>
            <span className="led" aria-hidden="true" />
            {form.submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
};

MetalForm.propTypes = {
  lookup: PropTypes.object.isRequired,
  editing: PropTypes.object,
  onDone: PropTypes.func.isRequired,
  hidden: PropTypes.bool,
};

export default MetalForm;
