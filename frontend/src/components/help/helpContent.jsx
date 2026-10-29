import { TopicLink, OpenWindow, Kbd, Callout } from "./HelpElements";

// FilmTrack's user manual. Each topic has a title, Index keywords, related
// topics and a body. TOC arranges topics into books for the Contents tab.
// Written for users, not developers: describe what's on screen, not the code.

export const TOPICS = {
  welcome: {
    title: "Welcome to FilmTrack",
    keywords: ["welcome", "introduction", "getting started", "overview"],
    related: ["desktop", "windows", "movies-overview", "shortcuts"],
    body: (
      <>
        <p>
          FilmTrack is your personal film diary. Log every movie you watch,
          rate it, attach a poster, and organise it by genre, director, actor
          and country — then explore your habits in the Statistics window.
        </p>
        <p>
          FilmTrack works like a small desktop: each tool opens in its own
          window, which you can move, minimise and switch between from the
          taskbar.
        </p>
        <h2>Where to start</h2>
        <ol>
          <li>
            Add the genres, directors, actors and countries you need in their
            managers (see <TopicLink to="managers">Managing your library</TopicLink>).
          </li>
          <li>
            Open the Movies Collection and{" "}
            <TopicLink to="movies-add">add your first movie</TopicLink>.
          </li>
          <li>
            Give it a poster —{" "}
            <TopicLink to="movies-posters">posters</TopicLink> can be uploaded
            or found online in a couple of clicks.
          </li>
        </ol>
        <OpenWindow id="movies" />
        <Callout type="tip">
          Hover over any button to see what it does. Use the <b>Index</b> tab
          on the left to look up a specific task.
        </Callout>
      </>
    ),
  },

  desktop: {
    title: "The desktop and taskbar",
    keywords: ["desktop", "icons", "taskbar", "start menu", "start button", "launch", "right-click", "context menu", "sort icons", "arrange icons", "new note", "new movie", "show desktop", "minimize all", "icon size", "large icons", "small icons", "date", "time", "clock"],
    related: ["desktop-icons", "windows", "shortcuts"],
    body: (
      <>
        <h2>Desktop icons</h2>
        <ul>
          <li>Click an icon to select it.</li>
          <li>
            Double-click it — or select it and press <Kbd>Enter</Kbd> — to open
            its window.
          </li>
          <li>Drag an icon to move it somewhere else on the desktop.</li>
        </ul>
        <p>
          You choose which icons appear — see{" "}
          <TopicLink to="desktop-icons">Choosing desktop icons</TopicLink>.
        </p>
        <h2>Desktop menu</h2>
        <p>Right-click an empty spot on the desktop, or an icon, for a menu of shortcuts:</p>
        <ul>
          <li><b>Show Desktop</b> minimizes every window. Click a window&apos;s taskbar button to bring it back.</li>
          <li><b>New Note</b> opens Notepad on a blank note.</li>
          <li><b>New Movie</b> opens the Movies Collection, ready to type a title.</li>
          <li>
            <b>Icon size</b> — Small, Medium, Large or Extra large desktop icons.
          </li>
          <li>
            <b>Sort icons by</b> — the order you chose in Desktop Icons, or by
            name from A to Z or Z to A.
          </li>
          <li>
            <b>Arrange icons in</b> — columns (down, then across) or rows
            (across, then down).
          </li>
          <li>
            <b>Desktop Icons…</b>, <b>Wallpaper Settings…</b> and <b>Help</b>{" "}
            open those windows.
          </li>
        </ul>
        <Callout type="note">
          Resizing, sorting or arranging puts every icon back on the grid,
          including any you dragged somewhere else. Your icon size, sort and
          arrangement are remembered by this browser.
        </Callout>
        <h2>Start menu</h2>
        <p>
          Click the round Start button at the bottom-left corner to see every
          window. Folders come first — <b>Accessories</b> (Calculator,
          Calendar, Clock, Notepad), <b>Games</b> and <b>System</b>{" "}
          (Backup &amp; Restore, Desktop Icons, Wallpaper Settings) — followed
          by the main tools.
        </p>
        <h2>Taskbar</h2>
        <p>
          Every open window gets a button on the taskbar. Click it to bring
          that window to the front — or to bring it back after minimising it.
        </p>
        <p>
          The right end of the taskbar shows today&apos;s date and the current
          time. Hover over them to see the full date, including the year.
        </p>
      </>
    ),
  },

  windows: {
    title: "Working with windows",
    keywords: ["window", "move", "minimize", "maximize", "close", "tooltips", "title bar"],
    related: ["desktop", "shortcuts"],
    body: (
      <>
        <p>All windows share the same controls in their title bar:</p>
        <table className="help-table">
          <tbody>
            <tr><td>Title bar</td><td>Drag it to move the window.</td></tr>
            <tr><td>🗕</td><td>Minimise. Click the window&apos;s taskbar button to restore it.</td></tr>
            <tr><td>🗖 / 🗗</td><td>Maximise to fill the screen, or restore it. Only on larger windows.</td></tr>
            <tr><td>🗙</td><td>Close.</td></tr>
            <tr><td>Window icon</td><td>Double-click the small icon at the top-left to close the window.</td></tr>
          </tbody>
        </table>
        <p>
          Click anywhere inside a window to bring it to the front.
        </p>
        <p>
          The Movies Collection, Directors Manager and Countries Manager also
          have a <b>+</b> button in the title bar that hides or shows their
          &quot;add&quot; form, leaving more room for the list.
        </p>
        <Callout type="tip">
          Hover over any button for a moment and a tooltip explains what it
          does.
        </Callout>
      </>
    ),
  },

  shortcuts: {
    title: "Keyboard shortcuts",
    keywords: ["keyboard", "shortcuts", "keys", "hotkeys", "escape", "enter", "tab"],
    related: ["movies-filter", "notepad", "calculator"],
    body: (
      <>
        <h2>Anywhere</h2>
        <table className="help-table">
          <tbody>
            <tr><td><Kbd>Ctrl</Kbd> + <Kbd>M</Kbd></td><td>Open the Movies Collection (when you&apos;re not typing in a field).</td></tr>
            <tr><td><Kbd>Enter</Kbd></td><td>Open the selected desktop icon.</td></tr>
            <tr><td><Kbd>Enter</Kbd> / <Kbd>Esc</Kbd></td><td>In a confirmation box: press the highlighted button / cancel. <Kbd>Tab</Kbd> switches between the buttons.</td></tr>
          </tbody>
        </table>
        <h2>Movies Collection</h2>
        <table className="help-table">
          <tbody>
            <tr><td><Kbd>Esc</Kbd></td><td>Clear the filter box you&apos;re typing in (Title, Year or Rating).</td></tr>
            <tr><td><Kbd>Enter</Kbd></td><td>Save the row you&apos;re editing (from any of its boxes).</td></tr>
            <tr><td><Kbd>Tab</Kbd> in Countries</td><td>Jump straight to the <b>Add Movie</b> button.</td></tr>
            <tr><td><Kbd>Esc</Kbd></td><td>Close the poster menu or the poster search window.</td></tr>
          </tbody>
        </table>
        <h2>Notepad</h2>
        <table className="help-table">
          <tbody>
            <tr><td><Kbd>Ctrl</Kbd> + <Kbd>S</Kbd></td><td>Save the note.</td></tr>
            <tr><td><Kbd>Ctrl</Kbd> + <Kbd>B</Kbd> / <Kbd>I</Kbd> / <Kbd>U</Kbd></td><td>Bold, italic, underline.</td></tr>
            <tr><td><Kbd>Tab</Kbd> / <Kbd>Shift</Kbd> + <Kbd>Tab</Kbd></td><td>Indent / outdent while writing.</td></tr>
            <tr><td><Kbd>Esc</Kbd></td><td>Leave the writing area, so <Kbd>Tab</Kbd> moves between controls again.</td></tr>
          </tbody>
        </table>
        <h2>Calculator</h2>
        <table className="help-table">
          <tbody>
            <tr><td><Kbd>0</Kbd>–<Kbd>9</Kbd> <Kbd>.</Kbd> <Kbd>+</Kbd> <Kbd>-</Kbd> <Kbd>*</Kbd> <Kbd>/</Kbd></td><td>Type numbers and operations.</td></tr>
            <tr><td><Kbd>Enter</Kbd> or <Kbd>=</Kbd></td><td>Calculate.</td></tr>
            <tr><td><Kbd>Esc</Kbd> or <Kbd>C</Kbd></td><td>Clear.</td></tr>
          </tbody>
        </table>
      </>
    ),
  },

  "movies-overview": {
    title: "Movies Collection overview",
    keywords: ["movies", "collection", "table", "list"],
    related: ["movies-add", "movies-edit", "movies-filter", "movies-posters"],
    body: (
      <>
        <p>
          The Movies Collection is the heart of FilmTrack. From top to bottom
          it holds:
        </p>
        <ul>
          <li><b>The add form</b> — log a new movie (<TopicLink to="movies-add">Adding a movie</TopicLink>).</li>
          <li><b>Saved views</b> — store and recall filter setups (<TopicLink to="movies-views">Saved views</TopicLink>).</li>
          <li><b>Filters</b> — narrow the list down (<TopicLink to="movies-filter">Filtering movies</TopicLink>).</li>
          <li><b>The table</b> — every movie, one per row (<TopicLink to="movies-edit">Editing and deleting</TopicLink>, <TopicLink to="movies-sort">Sorting</TopicLink>).</li>
        </ul>
        <p>Title bar extras:</p>
        <ul>
          <li><b>➕</b> hides or shows the add form.</li>
          <li><b>🔄</b> reloads everything — handy after adding a genre, director, actor or country in another window.</li>
        </ul>
        <OpenWindow id="movies" />
      </>
    ),
  },

  "movies-add": {
    title: "Adding a movie",
    keywords: ["add movie", "new movie", "log", "watched date", "date format", "rating", "release year"],
    related: ["movies-posters", "managers", "movies-edit"],
    body: (
      <>
        <ol>
          <li>Type the <b>Movie title</b>. An <b>Alternative title</b> (e.g. the original-language title) is optional.</li>
          <li>Enter the <b>Release year</b> and, optionally, your <b>Rating</b> (0–10).</li>
          <li>
            Optionally, enter the date you watched it. Type <b>DD/MM</b> for
            this year (e.g. <code>14/10</code>) or <b>DD/MM/YYYY</b> for
            another year. Leave it empty if you don&apos;t remember.
          </li>
          <li>
            Pick <b>genres</b>, <b>directors</b>, <b>actors</b> and{" "}
            <b>countries</b>. Start typing inside a box to search its list.
          </li>
          <li>Click <b>Add Movie</b>.</li>
        </ol>
        <p>
          The form then clears and puts the cursor back in the title box,
          ready for the next movie.
        </p>
        <Callout type="note">
          <b>Add Movie</b> stays greyed out until there is a title and a
          release year. If the date can&apos;t be read (say, <code>31/02</code>),
          the date box turns red and the movie isn&apos;t added until you fix
          or clear it. Hover over the red box for a reminder of the format.
        </Callout>
        <h2>Adding a poster at the same time</h2>
        <p>
          The 🖼️ button beside <b>Add Movie</b> lets you choose a poster before
          the movie exists. Pick <b>Upload file…</b> or <b>Search TMDB…</b>{" "}
          (type the title first). A tiny thumbnail of your choice appears on
          the button; hover it for a bigger preview. The poster is attached
          when you click <b>Add Movie</b>.
        </p>
        <Callout type="caution">
          The chosen poster is only kept until the movie is added. If you close
          the window or the app first, you&apos;ll need to pick it again.
        </Callout>
        <h2>Missing a genre or person?</h2>
        <p>
          The dropdowns only list what exists in the{" "}
          <TopicLink to="managers">managers</TopicLink>. Add it there first,
          then click 🔄 in the Movies title bar if it doesn&apos;t show up.
        </p>
        <Callout type="tip">
          When you&apos;re in the Countries box, <Kbd>Tab</Kbd> jumps straight
          to <b>Add Movie</b>. Press <Kbd>Enter</Kbd> to add.
        </Callout>
      </>
    ),
  },

  "movies-edit": {
    title: "Editing and deleting movies",
    keywords: ["edit movie", "change", "update", "delete movie", "remove movie", "save"],
    related: ["movies-add", "movies-posters"],
    body: (
      <>
        <h2>Editing</h2>
        <ol>
          <li>Click any cell in a row, or the row&apos;s 📝 button. The whole row becomes editable.</li>
          <li>Make your changes. The watched date accepts DD/MM or DD/MM/YYYY, as in the add form, or can be left empty.</li>
          <li>Press <Kbd>Enter</Kbd> in any box, or click ✅, to save the whole row — or click ❌ to cancel.</li>
        </ol>
        <Callout type="tip">
          The Countries column shows flags. Hover over them to see the
          country names.
        </Callout>
        <Callout type="note">
          If the date can&apos;t be read, its box turns red and the row stays in
          edit mode until you fix or clear it.
        </Callout>
        <h2>Deleting</h2>
        <p>
          Click 🗑️ at the end of a row. FilmTrack asks you to confirm: press{" "}
          <Kbd>Enter</Kbd> or click <b>Delete</b> to go ahead, or{" "}
          <Kbd>Esc</Kbd> / <b>Cancel</b> to keep the movie.
        </p>
        <Callout type="caution">
          Deleting removes the movie and its poster for good. It can&apos;t be
          undone.
        </Callout>
      </>
    ),
  },

  "movies-sort": {
    title: "Sorting the table",
    keywords: ["sort", "order", "column", "ascending", "descending"],
    related: ["movies-filter", "movies-views"],
    body: (
      <>
        <p>
          Click any column header to sort by it. Click the same header again
          to reverse the order. An arrow shows the current sort:
        </p>
        <ul>
          <li><b>🔼</b> ascending (A→Z, oldest first, lowest first)</li>
          <li><b>🔽</b> descending</li>
        </ul>
        <p>
          The sort order is saved with a{" "}
          <TopicLink to="movies-views">view</TopicLink>.
        </p>
      </>
    ),
  },

  "movies-filter": {
    title: "Filtering movies",
    keywords: ["filter", "search", "find movie", "clear filter", "reset filters", "escape", "broom"],
    related: ["movies-views", "movies-sort", "shortcuts"],
    body: (
      <>
        <p>The filter bar narrows the table down. Filters combine — a movie has to pass all of them.</p>
        <table className="help-table">
          <tbody>
            <tr><td>Title</td><td>Matches part of the title <i>or</i> the alternative title.</td></tr>
            <tr><td>Min / Max Year</td><td>Release year range. Fill in one or both.</td></tr>
            <tr><td>Genres, Directors, Countries</td><td>Shows movies with <i>any</i> of the selected entries.</td></tr>
            <tr><td>Min / Max Rating</td><td>Rating range, 0–10.</td></tr>
          </tbody>
        </table>
        <h2>Clearing filters</h2>
        <ul>
          <li>Click the <b>×</b> inside the Title box to empty it.</li>
          <li>Press <Kbd>Esc</Kbd> while typing in the Title, Year or Rating boxes to empty that box.</li>
          <li>Remove a genre, director or country by clicking its <b>×</b> inside the dropdown.</li>
          <li>
            Click <b>🧹</b> at the end of the bar to reset <i>every</i> filter
            at once. It&apos;s greyed out while nothing is being filtered.
          </li>
        </ul>
        <Callout type="tip">
          Use the same set of filters often? Save it as a{" "}
          <TopicLink to="movies-views">view</TopicLink>.
        </Callout>
      </>
    ),
  },

  "movies-views": {
    title: "Saved views",
    keywords: ["views", "save view", "load view", "presets", "delete view", "rename view", "update view", "default view", "star"],
    related: ["movies-filter", "movies-sort"],
    body: (
      <>
        <p>A view remembers your current filters and sort order, so you can get back to them in one click. Views live in the <b>🔖 Views</b> button at the start of the filter bar.</p>
        <h2>Saving a view</h2>
        <ol>
          <li>Set up the filters and sorting you want.</li>
          <li>Click <b>🔖 Views</b> and choose <b>Save as New View…</b>.</li>
          <li>Type a name and press <b>Enter</b>.</li>
        </ol>
        <h2>Using views</h2>
        <ul>
          <li>Pick a view from the menu to apply it. The button turns blue and shows the view&apos;s name (hover it for the full name if it&apos;s cut off).</li>
          <li>An orange <b>•</b> on the button means you&apos;ve changed the filters or sort since loading the view. <b>Update</b> saves those changes into it.</li>
          <li><b>All Movies</b> clears every filter and goes back to sorting by title.</li>
          <li><b>Rename…</b> and <b>Delete…</b> act on the view that&apos;s loaded.</li>
        </ul>
        <h2>Default view</h2>
        <p>With a view loaded, tick <b>Open by Default</b> to apply it every time the Movies window opens. It&apos;s marked with ★ in the menu. Only one view can be the default; with none, the window opens on the full list.</p>
      </>
    ),
  },

  "movies-posters": {
    title: "Movie posters",
    keywords: ["poster", "image", "tmdb", "upload poster", "replace poster", "remove poster", "artwork"],
    related: ["poster-viewer", "movies-add", "pairs"],
    body: (
      <>
        <p>The 🖼️ column shows each movie&apos;s poster status:</p>
        <ul>
          <li><b>Faded 🖼️</b> — no poster yet. Click it to add one.</li>
          <li><b>Coloured 🖼️</b> — has a poster. Hover for a preview; click to open it in the <TopicLink to="poster-viewer">Poster Viewer</TopicLink>.</li>
        </ul>
        <h2>Adding a poster</h2>
        <p>Click the faded 🖼️ and choose:</p>
        <ul>
          <li><b>📁 Upload file…</b> — pick a JPG, PNG or WebP image from your computer.</li>
          <li><b>🔍 Search TMDB…</b> — search The Movie Database online.</li>
        </ul>
        <h2>Searching TMDB</h2>
        <p>
          The search starts straight away using the movie&apos;s title and
          year. Click a poster to use it. If you don&apos;t see the right one:
        </p>
        <ul>
          <li>Edit the title and click <b>Search</b>.</li>
          <li>Click <b>Alt</b> to search by the alternative title instead (shown only when the movie has one).</li>
          <li>Clear the year — release years sometimes differ between countries.</li>
        </ul>
        <p>Press <Kbd>Esc</Kbd> or click ✖ to close without choosing.</p>
        <h2>Replacing or removing a poster</h2>
        <p>
          Edit the row (📝). The poster cell then shows 🖼️ to replace the poster
          and 🚫 to remove it.
        </p>
        <Callout type="tip">
          You can also choose a poster while adding a movie — see{" "}
          <TopicLink to="movies-add">Adding a movie</TopicLink>.
        </Callout>
      </>
    ),
  },

  "poster-viewer": {
    title: "Poster Viewer",
    keywords: ["poster viewer", "zoom", "pan", "full size", "fit"],
    related: ["movies-posters"],
    body: (
      <>
        <p>
          Opens when you click a movie&apos;s coloured 🖼️ in the Movies
          Collection. It shows the poster at full quality.
        </p>
        <table className="help-table">
          <tbody>
            <tr><td><b>Fit</b></td><td>Fit the whole poster in the window.</td></tr>
            <tr><td><b>100%</b></td><td>Show the poster at its real size.</td></tr>
            <tr><td><b>−</b> / <b>+</b></td><td>Zoom out / in.</td></tr>
            <tr><td>Drag the image</td><td>Move around a zoomed-in poster.</td></tr>
            <tr><td>Double-click the image</td><td>Switch between Fit and 100%.</td></tr>
          </tbody>
        </table>
        <p>Maximise the window (🗖) for the biggest view.</p>
      </>
    ),
  },

  managers: {
    title: "Genres, Directors and Actors",
    keywords: ["genres", "directors", "actors", "manager", "add genre", "add director", "add actor", "rename", "delete genre", "alphabetical"],
    related: ["countries", "movies-add"],
    body: (
      <>
        <p>
          These three managers work the same way. Whatever you add here
          becomes available in the Movies Collection&apos;s dropdowns.
        </p>
        <h2>Adding</h2>
        <p>
          Type a name and press <Kbd>Enter</Kbd> or click the <b>Add</b>{" "}
          button. Names that already exist are rejected, so you won&apos;t get
          duplicates.
        </p>
        <h2>Editing</h2>
        <p>
          Click a name in the list. The form switches to <b>Edit</b> mode;
          change the name and click <b>Update</b>, or{" "}
          <b>← Cancel Edit</b>. The new name shows on every movie that uses it.
        </p>
        <h2>Deleting</h2>
        <p>Click the <b>×</b> on a name and confirm.</p>
        <Callout type="caution">
          Deleting removes it from every movie that used it.
        </Callout>
        <h2>Finding and sorting</h2>
        <ul>
          <li>Type in the <b>Filter</b> box above the list to find a name. Click its <b>×</b> to clear it.</li>
          <li>Untick <b>Alphabetical</b> to list names in the order they were added.</li>
        </ul>
        <p>The Directors Manager&apos;s <b>+</b> title-bar button hides the add form for a longer list.</p>
        <OpenWindow id="genres" />
        <OpenWindow id="directors" />
        <OpenWindow id="actors" />
      </>
    ),
  },

  countries: {
    title: "Countries and flags",
    keywords: ["countries", "flags", "flag emoji", "add country"],
    related: ["managers"],
    body: (
      <>
        <p>
          The Countries Manager works like the{" "}
          <TopicLink to="managers">other managers</TopicLink>, with one extra
          field: a <b>Flag Emoji</b>.
        </p>
        <p>
          Paste a flag such as 🇫🇷 into the field. You can copy one from your
          system&apos;s emoji picker or any emoji website. The flag appears
          beside the country here and in the Movies Collection&apos;s Countries
          column.
        </p>
        <p>The brass <b>+</b> rivet in the title bar hides or shows the add form.</p>
        <OpenWindow id="countries" />
      </>
    ),
  },

  stats: {
    title: "Statistics",
    keywords: ["statistics", "stats", "charts", "graphs", "average rating", "top directors", "top actors"],
    related: ["movies-overview"],
    body: (
      <>
        <p>Statistics summarises your whole collection.</p>
        <ul>
          <li><b>Summary</b> — total movies, average rating, top genre, and how many directors and actors you&apos;ve logged.</li>
          <li><b>Charts</b> — movies by genre and by country, average rating by genre, how your ratings are spread, your most-watched directors and actors, and rating against release year.</li>
        </ul>
        <p>
          Hover over a bar, slice or dot to see its exact numbers. Some
          charts have buttons in their corner (<b>Bar</b>, <b>Pie</b>,{" "}
          <b>Radar</b>) to switch how they&apos;re drawn.
        </p>
        <Callout type="tip">Maximise the window to see more charts at once.</Callout>
        <OpenWindow id="stats" />
      </>
    ),
  },

  backup: {
    title: "Backup, restore and CSV export",
    keywords: ["backup", "restore", "export", "csv", "spreadsheet", "database", "save data"],
    related: ["wallpaper"],
    body: (
      <>
        <h2>Making a backup</h2>
        <p>
          Click <b>💽 Backup Database</b>. A file containing all your movies,
          genres, people, countries, views and notes is downloaded.
        </p>
        <Callout type="note">
          Poster images aren&apos;t included in the backup file.
        </Callout>
        <h2>Automatic backups</h2>
        <p>
          FilmTrack also makes a backup by itself the first time it starts
          each day. It keeps the last 14 days in the <b>backups</b> folder
          inside FilmTrack&apos;s <b>data</b> folder (<code>data/backups</code>).
        </p>
        <h2>Restoring a backup</h2>
        <ol>
          <li>Click <b>Select File</b> and choose a backup file.</li>
          <li>Click <b>🧰 Restore Database</b>.</li>
          <li>Reload the page to see the restored data.</li>
        </ol>
        <Callout type="caution">
          Restoring <b>replaces all your current data</b> with the
          backup&apos;s, without asking first. Your current data isn&apos;t
          lost, though: it&apos;s saved first in the <b>backups</b> folder as
          a file whose name starts with <code>before-restore</code>.
        </Callout>
        <p>
          A file that isn&apos;t a FilmTrack backup, or that is damaged, is
          refused, and your data stays as it was.
        </p>
        <h2>Exporting to a spreadsheet</h2>
        <p>
          Tick the columns you want under <b>Select columns to include</b>,
          then click <b>📊 Export CSV</b>. The file opens in any spreadsheet
          program.
        </p>
        <OpenWindow id="backup" />
      </>
    ),
  },

  "desktop-icons": {
    title: "Choosing desktop icons",
    keywords: ["desktop icons", "shortcuts on desktop", "customize desktop", "show icon", "hide icon", "icon size", "large icons", "small icons"],
    related: ["desktop", "wallpaper"],
    body: (
      <>
        <p>
          Any program from the Start menu can also sit on the desktop as an
          icon. Open <b>Desktop Icons</b> from the Start menu&apos;s{" "}
          <b>System</b> folder.
        </p>
        <ul>
          <li>Tick a program to add its icon; untick it to remove it. The desktop updates straight away.</li>
          <li>Programs are grouped the same way as in the Start menu.</li>
          <li>Newly added icons join the end of the list on the desktop.</li>
          <li><b>Restore Defaults</b> brings back the original set of icons.</li>
        </ul>
        <h2>Icon size</h2>
        <p>
          Under <b>Icon size</b>, pick <b>Small</b>, <b>Medium</b>,{" "}
          <b>Large</b> or <b>Extra large</b>. The same choice is in the
          desktop&apos;s right-click menu. Restore Defaults doesn&apos;t
          change the size.
        </p>
        <Callout type="note">
          Whenever you add or remove an icon or change the icon size, the
          desktop icons line up neatly again, so any you&apos;d dragged
          elsewhere return to the grid. Like the wallpaper, your choices are
          remembered by this browser only.
        </Callout>
        <OpenWindow id="desktopIcons" />
      </>
    ),
  },

  wallpaper: {
    title: "Changing the wallpaper",
    keywords: ["wallpaper", "background", "desktop image", "tile", "fill", "pattern"],
    related: ["desktop"],
    body: (
      <>
        <p>
          Wallpaper Settings shows a preview of your current wallpaper and
          thumbnails to choose from. Click a thumbnail to use it right away.
        </p>
        <ul>
          <li><b>FilmTrack</b> — wallpapers made for FilmTrack. They always fill the screen.</li>
          <li><b>Patterns</b> — small designs repeated across the screen.</li>
          <li>
            <b>Your picture</b> — click <b>Browse…</b> to use any image from
            your computer. Choose <b>Fill</b> to stretch it over the screen or{" "}
            <b>Tile</b> to repeat it. The × on its thumbnail removes it.
          </li>
        </ul>
        <p>
          FilmTrack remembers your last picture, so you can switch to a
          built-in wallpaper and back without choosing it again.
        </p>
        <Callout type="note">
          The wallpaper is remembered by this browser only. It isn&apos;t part
          of your backups. Very large pictures may be too big to remember and
          are gone after a reload.
        </Callout>
        <OpenWindow id="wallpaper" />
      </>
    ),
  },

  notepad: {
    title: "Notepad",
    keywords: ["notepad", "notes", "write", "formatting", "text", "bold", "save note", "right-click", "context menu", "cut", "copy", "paste", "spelling"],
    related: ["shortcuts"],
    body: (
      <>
        <p>Keep written notes — watchlists, reviews, anything — saved inside FilmTrack.</p>
        <h2>Managing notes</h2>
        <ul>
          <li>Your notes are listed at the side. Click one to open it.</li>
          <li><b>📄</b> starts a new note; give it a title in the box at the top.</li>
          <li><b>💾</b> or <Kbd>Ctrl</Kbd> + <Kbd>S</Kbd> saves it.</li>
          <li><b>🗑️</b> deletes the open note, after asking.</li>
        </ul>
        <p>
          A <b>●</b> dot means there are unsaved changes. If you switch notes,
          start a new one or close Notepad, FilmTrack asks whether to save
          them first.
        </p>
        <h2>Formatting</h2>
        <p>
          Select some text and use the toolbar: paragraph style (headings),
          bold, italic, underline, strikethrough, superscript and subscript,
          text and highlight colours, lists, indents, alignment, quote
          blocks, separator lines, and clear formatting.
        </p>
        <h2>Right-click menu</h2>
        <p>
          Right-click in the text for quick access to the same tools. They
          apply to the text you had selected, or at the cursor:
        </p>
        <ul>
          <li>
            The top rows hold <b>Cut</b>, <b>Copy</b>, <b>Paste</b> and{" "}
            <b>Select all</b>, then bold, italic, underline, strikethrough,
            superscript and subscript. A highlighted button means the selected
            text already has that formatting.
          </li>
          <li>
            <b>Paragraph style</b> opens a list of headings; the colour dots
            set the text and highlight colours.
          </li>
          <li>Lists, quote, clear formatting, separator line and <b>Save note</b> follow.</li>
        </ul>
        <Callout type="note">
          <b>Paste</b> in this menu inserts plain text. To paste with
          formatting, press <Kbd>Ctrl</Kbd> + <Kbd>V</Kbd>. The first time, your
          browser may ask whether FilmTrack can see the clipboard.
        </Callout>
        <Callout type="tip">
          For spelling suggestions, hold <Kbd>Shift</Kbd> while you
          right-click: that shows your browser&apos;s own menu.
        </Callout>
        <Callout type="tip">
          While writing, <Kbd>Tab</Kbd> indents. Press <Kbd>Esc</Kbd> to leave
          the text so <Kbd>Tab</Kbd> moves between buttons again.
        </Callout>
        <OpenWindow id="notepad" />
      </>
    ),
  },

  calculator: {
    title: "Calculator",
    keywords: ["calculator", "math", "sum"],
    related: ["shortcuts"],
    body: (
      <>
        <p>Click the buttons, or type on your keyboard.</p>
        <Callout type="note">
          The keyboard only works while the calculator is the active window.
          Click it first.
        </Callout>
        <p>
          Use <Kbd>Enter</Kbd> or <Kbd>=</Kbd> to calculate, and{" "}
          <Kbd>Esc</Kbd> or <Kbd>C</Kbd> to clear.
        </p>
        <OpenWindow id="calculator" />
      </>
    ),
  },

  "calendar-clock": {
    title: "Calendar and Clock",
    keywords: ["calendar", "clock", "date", "time", "month", "24-hour", "12-hour", "am/pm", "digital"],
    related: ["desktop"],
    body: (
      <>
        <h2>Calendar</h2>
        <p>Shows a month at a time with today highlighted. Use the arrow buttons to move between months.</p>
        <OpenWindow id="calendar" />
        <h2>Clock</h2>
        <p>
          An analogue clock showing your computer&apos;s local time. Its title
          bar shows the same time in digits, with seconds.
        </p>
        <Callout type="note">
          The digital time uses the 24-hour format. Right-click the clock face
          to switch to 12-hour time (AM/PM). The clock goes back to 24-hour the
          next time you open it.
        </Callout>
        <OpenWindow id="clock" />
      </>
    ),
  },

  pairs: {
    title: "Poster Pairs",
    keywords: ["pairs", "game", "memory", "match"],
    related: ["movies-posters"],
    body: (
      <>
        <p>A memory game played with your own posters.</p>
        <ol>
          <li>Click a card to flip it, then click another.</li>
          <li>If both show the same poster, they stay face up. If not, they flip back.</li>
          <li>Match every pair in as few moves as you can.</li>
        </ol>
        <p>
          Hover over a matched card to see the movie&apos;s title. Click{" "}
          <b>New Game</b> at any time to reshuffle.
        </p>
        <Callout type="note">
          The deck uses up to 8 movies that have posters. You need at least
          2 movies with posters to play.
        </Callout>
        <OpenWindow id="pairs" />
      </>
    ),
  },
};

// Contents tab: books hold topic ids; bare strings are top-level pages
export const TOC = [
  "welcome",
  { book: "Getting Started", topics: ["desktop", "windows", "shortcuts"] },
  {
    book: "Movies Collection",
    topics: [
      "movies-overview",
      "movies-add",
      "movies-edit",
      "movies-sort",
      "movies-filter",
      "movies-views",
      "movies-posters",
      "poster-viewer",
    ],
  },
  { book: "Your Library", topics: ["managers", "countries"] },
  "stats",
  { book: "System", topics: ["backup", "wallpaper", "desktop-icons"] },
  { book: "Accessories", topics: ["notepad", "calculator", "calendar-clock"] },
  { book: "Games", topics: ["pairs"] },
];
