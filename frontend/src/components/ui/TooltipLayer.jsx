import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const SHOW_DELAY = 450;
const GAP = 6; // px between the element and the tooltip
const EDGE = 4; // px kept clear of the viewport edges

// Replaces the browser's native `title` tooltips app-wide with a styled one.
// While an element is hovered its `title` is moved to `data-tooltip` (so the
// native tooltip never appears) and put back when the pointer leaves, so
// components keep using plain `title` props. Pointer events are used because,
// unlike mouse events, they still fire on disabled buttons.
const TooltipLayer = () => {
  const [tip, setTip] = useState(null); // { text, rect }
  const [pos, setPos] = useState(null);
  const tipRef = useRef(null);

  useEffect(() => {
    let current = null; // element whose title we've borrowed
    let observer = null;
    let timer = null;

    const release = () => {
      clearTimeout(timer);
      observer?.disconnect();
      if (current && !current.hasAttribute("title")) {
        current.setAttribute("title", current.dataset.tooltip);
      }
      if (current) delete current.dataset.tooltip;
      current = null;
      setTip(null);
    };

    const onOver = (e) => {
      const el = e.target.closest?.("[title], [data-tooltip]");
      if (el === current) return;
      release();
      if (!el || e.pointerType === "touch") return;
      const text = el.getAttribute("title");
      if (!text) return;

      current = el;
      el.dataset.tooltip = text;
      el.removeAttribute("title");
      // React re-adds `title` if the prop changes mid-hover — absorb it
      observer = new MutationObserver(() => {
        const next = el.getAttribute("title");
        if (next === null) return;
        el.removeAttribute("title");
        if (next) {
          el.dataset.tooltip = next;
          setTip((prev) => prev && { ...prev, text: next });
        }
      });
      observer.observe(el, { attributes: true, attributeFilter: ["title"] });

      timer = setTimeout(() => {
        if (current === el && el.isConnected) {
          setTip({ text: el.dataset.tooltip, rect: el.getBoundingClientRect() });
        }
      }, SHOW_DELAY);
    };

    const onOut = (e) => {
      if (current && !current.contains(e.relatedTarget)) release();
    };

    window.addEventListener("pointerover", onOver);
    window.addEventListener("pointerout", onOut);
    window.addEventListener("pointerdown", release);
    window.addEventListener("keydown", release);
    window.addEventListener("scroll", release, true);
    window.addEventListener("blur", release);
    return () => {
      release();
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointerdown", release);
      window.removeEventListener("keydown", release);
      window.removeEventListener("scroll", release, true);
      window.removeEventListener("blur", release);
    };
  }, []);

  // Centre under the element; flip above and clamp to stay on screen
  useLayoutEffect(() => {
    if (!tip || !tipRef.current) {
      setPos(null);
      return;
    }
    const { width, height } = tipRef.current.getBoundingClientRect();
    const { rect } = tip;
    let top = rect.bottom + GAP;
    if (top + height > window.innerHeight - EDGE) top = rect.top - GAP - height;
    const left = Math.min(
      Math.max(rect.left + rect.width / 2 - width / 2, EDGE),
      window.innerWidth - width - EDGE
    );
    setPos({ top: Math.max(top, EDGE), left });
  }, [tip]);

  if (!tip) return null;

  return createPortal(
    <div
      ref={tipRef}
      className="aero-tooltip"
      role="tooltip"
      style={pos ? { top: pos.top, left: pos.left } : { visibility: "hidden" }}
    >
      {tip.text}
    </div>,
    document.body
  );
};

export default TooltipLayer;
