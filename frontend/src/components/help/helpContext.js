import { createContext } from "react";

// Lets help topics link to other topics and launch app windows without
// HelpWindow having to pass callbacks into every topic body.
export const HelpContext = createContext({
  navigate: () => {},
  openWindow: () => {},
});
