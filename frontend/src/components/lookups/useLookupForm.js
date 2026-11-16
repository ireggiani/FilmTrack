import { useEffect, useRef, useState } from 'react';
import { saveItem, useList } from '../../services/lists.js';

const blank = (lookup) => Object.fromEntries(lookup.fields.map(({ key }) => [key, '']));

// Everything a manager's form does, whatever it looks like: `editing` is the
// item being edited (null while adding) and `onDone` ends the edit.
export function useLookupForm(lookup, editing, onDone) {
  const { items } = useList(lookup.list);
  const [values, setValues] = useState(() => blank(lookup));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const nameRef = useRef(null);
  const refocus = useRef(false);
  const { errorPrefix } = lookup.theme;

  useEffect(() => {
    if (editing) {
      setValues(Object.fromEntries(lookup.fields.map(({ key }) => [key, editing[key] ?? ''])));
      setError('');
      nameRef.current?.focus();
    } else {
      setValues(blank(lookup));
    }
  }, [editing, lookup]);

  // After a save, the cursor goes back to the name for the next one. Done once
  // the save has finished, because the boxes are disabled until then.
  useEffect(() => {
    if (saving || !refocus.current) return;
    refocus.current = false;
    nameRef.current?.focus();
  }, [saving]);

  const trimmed = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, value.trim()]),
  );
  const complete = Object.values(trimmed).every(Boolean);

  const submit = async (e) => {
    e.preventDefault();
    if (!complete) return;

    // The database also refuses these, but not always whatever the capitalization
    const taken = items.some(
      (item) =>
        item.id !== editing?.id && item.name.toLowerCase() === trimmed.name.toLowerCase(),
    );
    if (taken) {
      setError(errorPrefix + lookup.duplicate);
      return;
    }

    setError('');
    setSaving(true);
    try {
      await saveItem(lookup.list, editing?.id ?? null, trimmed, `Could not save the ${lookup.noun}`);
      setValues(blank(lookup));
      refocus.current = true;
      if (editing) onDone();
    } catch (err) {
      console.error(`Error ${editing ? 'updating' : 'creating'} ${lookup.noun}:`, err);
      setError(errorPrefix + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Props for a field's <input>
  const input = (field) => ({
    ref: field === lookup.fields[0] ? nameRef : undefined,
    id: field.id,
    type: 'text',
    value: values[field.key],
    onChange: (e) => {
      const { value } = e.target;
      if (field.maxLength && value.length > field.maxLength) return;
      setValues((current) => ({ ...current, [field.key]: value }));
      setError('');
    },
    placeholder: field.placeholder,
    disabled: saving,
    className: 'text-field',
    maxLength: field.maxLength,
  });

  const action = editing ? 'Update' : 'Add';
  return {
    isEditing: Boolean(editing),
    heading: editing ? `Edit ${lookup.label}` : `Add New ${lookup.label}`,
    submitLabel: saving ? (editing ? 'Updating...' : 'Adding...') : `${action} ${lookup.label}`,
    canSubmit: complete && !saving,
    error,
    input,
    submit,
    cancel: onDone,
  };
}
