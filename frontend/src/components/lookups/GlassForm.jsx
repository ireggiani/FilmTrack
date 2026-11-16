import PropTypes from 'prop-types';
import { useLookupForm } from './useLookupForm';

const GlassForm = ({ lookup, editing, onDone, hidden }) => {
  const form = useLookupForm(lookup, editing, onDone);
  const lastField = lookup.fields.at(-1);

  return (
    <form className={`${lookup.noun}-form${hidden ? ' hide' : ''}`} onSubmit={form.submit}>
      <h2 className="heading-centre">{form.heading}</h2>

      {lookup.fields.map((field) => (
        <div className="form-group" key={field.key}>
          <label htmlFor={field.id}>{field.label}</label>
          <input {...form.input(field)} />
          {field === lastField && form.error && (
            <p style={{ color: '#ff6b6b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {form.error}
            </p>
          )}
        </div>
      ))}
      <div className="buttons">
        {form.isEditing && (
          <button type="button" onClick={form.cancel} className="btn">
            ← Cancel Edit
          </button>
        )}
        <button type="submit" className="btn submit" disabled={!form.canSubmit}>
          {form.submitLabel}
        </button>
      </div>
    </form>
  );
};

GlassForm.propTypes = {
  lookup: PropTypes.object.isRequired,
  editing: PropTypes.object,
  onDone: PropTypes.func.isRequired,
  hidden: PropTypes.bool,
};

export default GlassForm;
