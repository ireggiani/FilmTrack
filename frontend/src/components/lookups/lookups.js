import { GLASS, METAL, PAPER } from './themes';

// The four managers: one window, form and list (LookupWindow), told apart by
// what's described here.
//
//   list       its name in services/lists.js
//   noun/label how messages and buttons name one item ("genre", "Add Genre")
//   title      the list's heading; the window is "<title> Manager"
//   duplicate  shown when the name is already taken
//   fields     the form's boxes, all required. The first is the name, and its
//              id must match the window's focusSelector in windowRegistry.js
//   icon       the field shown before the name on each pill
//   theme      how it looks (themes.js)
const nameField = (id, label, noun) => ({
  key: 'name',
  id,
  label,
  placeholder: `Enter ${noun} name`,
});

export const GENRES = {
  list: 'genres',
  noun: 'genre',
  label: 'Genre',
  title: 'Genres',
  duplicate: 'Genre already exists',
  fields: [nameField('genreName', 'Genre Name:', 'genre')],
  theme: GLASS,
};

export const ACTORS = {
  list: 'actors',
  noun: 'actor',
  label: 'Actor',
  title: 'Actors',
  duplicate: 'Actor already exists',
  fields: [nameField('actorName', 'Actor Name', 'actor')],
  theme: GLASS,
};

export const DIRECTORS = {
  list: 'directors',
  noun: 'director',
  label: 'Director',
  title: 'Directors',
  duplicate: 'That director already exists.',
  fields: [nameField('directorName', 'Director Name', 'director')],
  theme: METAL,
};

export const COUNTRIES = {
  list: 'countries',
  noun: 'country',
  label: 'Country',
  title: 'Countries',
  duplicate: 'Country with that name already exists.',
  fields: [
    nameField('countryName', 'Country Name', 'country'),
    // 4 characters fits the longest flags
    { key: 'flagEmoji', id: 'flagEmoji', label: 'Flag Emoji', placeholder: '🇺🇸', maxLength: 4 },
  ],
  icon: 'flagEmoji',
  theme: PAPER,
};
