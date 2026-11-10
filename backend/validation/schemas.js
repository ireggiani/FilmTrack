const { z } = require('zod');

// Messages are shown to the user as they are, so each one names its field.
// Objects drop keys they don't list: the movie editor sends the whole movie
// back (id, Genres, posterUrl…) and only the listed fields reach the database.

const requiredText = (label) =>
  z.string({ error: `${label} is required` }).trim().min(1, `${label} is required`).max(255, `${label} is too long`);

// "" and null both mean "no value"
const blankToNull = (value) => (value === '' ? null : value);

// Numbers may arrive as text from form inputs ("1999"). Blank becomes null,
// numeric text becomes a number, anything else is left for the schema to reject.
const toNumber = (value) => {
  if (value === undefined) return undefined;
  if (value === '' || value === null) return null;
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) return Number(value);
  return value;
};

const optionalText = (label) =>
  z.preprocess(blankToNull, z.string({ error: `${label} must be text` }).trim().max(255, `${label} is too long`).nullable().optional());

const ids = (label) =>
  z.array(z.number({ error: `${label} must be a list of ids` }).int().positive(), { error: `${label} must be a list of ids` }).optional();

const releaseYear = z.preprocess(
  toNumber,
  z.number({ error: (issue) => (issue.input == null ? 'Release year is required' : 'Release year must be a number') })
    .int('Release year must be a whole number')
    .min(1870, 'Release year must be 1870 or later')
    .max(2100, 'Release year must be 2100 or earlier')
);

const rating = z.preprocess(
  toNumber,
  z.number({ error: 'Rating must be a number' })
    .int('Rating must be a whole number from 1 to 10')
    .min(1, 'Rating must be a whole number from 1 to 10')
    .max(10, 'Rating must be a whole number from 1 to 10')
    .nullable()
    .optional()
);

const watchedDate = z.preprocess(
  blankToNull,
  z.iso.date({ error: 'Watched date must be a date (YYYY-MM-DD)' }).nullable().optional()
);

const movie = z.object({
  title: requiredText('Title'),
  alternativeTitle: optionalText('Alternative title'),
  releaseYear,
  rating,
  watchedDate,
  genreIds: ids('Genres'),
  countryIds: ids('Countries'),
  directorIds: ids('Directors'),
  actorIds: ids('Actors')
});

const named = (label) => z.object({ name: requiredText(`${label} name`) });

const country = z.object({
  name: requiredText('Country name'),
  flagEmoji: requiredText('Flag').max(16, 'Flag is too long')
});

const view = z.object({
  name: requiredText('View name'),
  filters: z.record(z.string(), z.unknown(), { error: 'View filters must be an object' }),
  sorting: z.object({
    key: z.string({ error: 'View sorting needs a column' }),
    direction: z.enum(['ascending', 'descending'], { error: 'View sorting must be ascending or descending' })
  }, { error: 'View sorting must be { key, direction }' }).nullable().optional(),
  isDefault: z.boolean({ error: 'isDefault must be true or false' }).optional()
});

const note = z.object({
  title: z.string({ error: 'Note title must be text' }).trim().max(255, 'Note title is too long').optional(),
  content: z.string({ error: 'Note content must be text' }).optional()
});

// Updates may send only the fields that change (renaming a view, starring it…).
// Movies are the exception: the editor always sends the whole movie.
module.exports = {
  movie,
  genre: { create: named('Genre'), update: named('Genre').partial() },
  director: { create: named('Director'), update: named('Director').partial() },
  actor: { create: named('Actor'), update: named('Actor').partial() },
  country: { create: country, update: country.partial() },
  view: { create: view, update: view.partial() },
  note
};
