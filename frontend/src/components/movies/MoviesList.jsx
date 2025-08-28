import React from "react";
import MovieRow from "./MovieRow";

const MoviesList = ({ sortedMovies, getInlineSelectStyles, ...props }) => {
  return (
    <div
      style={{
        overflow: "auto",
        width: "100%",
        flex: 1,
        maxHeight: "calc(100vh - 240px)",
      }}
    >
      <table className="movies-table spreadsheet-table">
        <thead>
          {/* Movie List Headers */}
          <tr className="movies-table-row header-row">
            <th
              className="movies-table-header"
              onClick={() => props.requestSort("title")}
            >
              Title{props.getSortIndicator("title")}
            </th>
            <th
              className="movies-table-header"
              onClick={() => props.requestSort("alternativeTitle")}
            >
              Alt Title{props.getSortIndicator("alternativeTitle")}
            </th>
            <th
              className="movies-table-header"
              onClick={() => props.requestSort("releaseYear")}
            >
              Year{props.getSortIndicator("releaseYear")}
            </th>
            <th
              className="movies-table-header"
              style={{
                maxWidth: "100px",
                width: "100px",
                textAlign: "center",
              }}
              onClick={() => props.requestSort("rating")}
            >
              Rating{props.getSortIndicator("rating")}
            </th>
            <th
              className="movies-table-header"
              style={{
                maxWidth: "100px",
                width: "100px",
              }}
              onClick={() => props.requestSort("watchedDate")}
            >
              Watched{props.getSortIndicator("watchedDate")}
            </th>
            <th
              className="movies-table-header"
              onClick={() => props.requestSort("Genres")}
            >
              Genres{props.getSortIndicator("Genres")}
            </th>
            <th
              className="movies-table-header"
              onClick={() => props.requestSort("Directors")}
            >
              Directors{props.getSortIndicator("Directors")}
            </th>
            <th
              className="movies-table-header"
              onClick={() => props.requestSort("Actors")}
            >
              Actors{props.getSortIndicator("Actors")}
            </th>
            <th
              className="movies-table-header"
              onClick={() => props.requestSort("Countries")}
            >
              Countries{props.getSortIndicator("Countries")}
            </th>
            <th
              className="movies-table-header"
              style={{
                maxWidth: "100px",
                width: "100px",
              }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody style={{ overflow: "visible" }}>
          {/* Existing Movies */}
          {sortedMovies.map((movie) => (
            <MovieRow
              key={movie.id}
              movie={movie}
              onUpdate={props.handleUpdateMovie}
              onDelete={props.handleDeleteMovie}
              getInlineSelectStyles={getInlineSelectStyles}
              {...props}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(MoviesList);
