// @ts-check
// The two lists built from the same parts (useMovies, AddMovieForm, MoviesTable,
// MoviesList, MovieRow): what differs between them is described here.
//
//   list        its name in services/lists.js
//   path        API path, after /api
//   noun/plural how messages name one record and many, in lower case
//   label       the same in a button or placeholder ("Add Movie")
//   listTitle   the title of the window's own dialogs
//   tmdbType    which TMDB search finds its posters: 'movie' or 'tv'
//   filters     'full' shows every filter (year, rating, genres…); 'title' only
//               the title search. The hook filters on all of them either way,
//               so switching a list to 'full' needs no other change.
//   savedViews  the Views button. Saved views aren't tied to a list, so only
//               one list can have them until the views table records which.
//   popupClass  extra class for the poster menu and preview, which are drawn
//               outside the window and so can't be themed through it
/**
 * @typedef {object} Kind
 * @property {'movies' | 'series'} list
 * @property {string} path
 * @property {string} noun
 * @property {string} plural
 * @property {string} label
 * @property {string} listTitle
 * @property {'movie' | 'tv'} tmdbType
 * @property {'full' | 'title'} filters
 * @property {boolean} savedViews
 * @property {string} popupClass
 */

/** @type {Kind} */
export const MOVIE_KIND = {
  list: 'movies',
  path: '/movies',
  noun: 'movie',
  plural: 'movies',
  label: 'Movie',
  listTitle: 'Movies',
  tmdbType: 'movie',
  filters: 'full',
  savedViews: true,
  popupClass: '',
};

/** @type {Kind} */
export const SERIES_KIND = {
  list: 'series',
  path: '/series',
  noun: 'series',
  plural: 'series',
  label: 'Series',
  listTitle: 'Series',
  tmdbType: 'tv',
  filters: 'title',
  savedViews: false,
  popupClass: 'aqua-popup',
};
