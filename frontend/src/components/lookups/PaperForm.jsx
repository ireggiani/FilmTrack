import PropTypes from 'prop-types';
import { useLookupForm } from './useLookupForm';

const PaperForm = ({ lookup, editing, onDone, hidden }) => {
  const form = useLookupForm(lookup, editing, onDone);

  return (
    <form className={`${lookup.noun}-form${hidden ? ' hide' : ''}`} onSubmit={form.submit}>
      <h2 className="heading-centre--paper">{form.heading}</h2>

      <div className="inputs">
        {lookup.fields.map((field) => (
          <div className="form-group" key={field.key}>
            <label htmlFor={field.id} className="paper">
              {field.label}
            </label>
            <input {...form.input(field)} />
          </div>
        ))}
      </div>

      <div className="buttons">
        {form.isEditing && (
          <button type="button" onClick={form.cancel} className="btn--brass">
            ← Cancel Edit
          </button>
        )}
        {form.error && <p className="error--paper">{form.error}</p>}
        <button type="submit" className="btn--brass submit" disabled={!form.canSubmit}>
          {form.submitLabel}
        </button>
      </div>
    </form>
  );
};

PaperForm.propTypes = {
  lookup: PropTypes.object.isRequired,
  editing: PropTypes.object,
  onDone: PropTypes.func.isRequired,
  hidden: PropTypes.bool,
};

export default PaperForm;
