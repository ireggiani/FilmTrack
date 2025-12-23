import { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import "../../styles/accessories/_clock.scss";

const Clock = ({
  isOpen,
  isMinimized,
  onClose,
  onMinimize,
  onFocus,
  zIndex,
}) => {
  const nodeRef = useRef(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        nodeRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const seconds = time.getSeconds() * 6; // 360°/60 = 6° per second
  const minutes = (time.getMinutes() * 6) + (seconds / 60); // 6° per minute + smooth transition
  const hours = ((time.getHours() % 12) * 30) + (minutes / 12); // 30° per hour + smooth transition

  const renderHourMarkers = () => {
    const romanNumerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    const markers = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30); // 0° for XII at top, then 30°, 60°, etc.
      markers.push(
        <div
          key={i}
          className="hour-marker"
          style={{
            transform: `rotate(${angle}deg) translateY(-85px)`,
          }}
        >
          {romanNumerals[i]}
        </div>
      );
    }
    return markers;
  };

  return (
    <Draggable
      handle=".window-titlebar"
      nodeRef={nodeRef}
      cancel=".titlebar-button"
    >
      <div
        ref={nodeRef}
        className="window clock-window"
        onClick={onFocus}
        tabIndex={0}
        style={{
          zIndex,
          outline: 'none',
          ...(isMinimized && { display: "none" }),
        }}
      >
        <div className="window-titlebar metal">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>🕐</span>
            <span>Clock</span>
          </div>
          <div style={{ display: "flex" }}>
            <button
              className="titlebar-button window-minimize"
              onClick={onMinimize}
            >
              🗕
            </button>
            <button className="titlebar-button window-close" onClick={onClose}>
              🗙
            </button>
          </div>
        </div>
        <div className="clock-content">
          <div className="clock-face">
            <div className="clock-bezel">
              <div className="clock-inner">
                {renderHourMarkers()}
                <div className="clock-center"></div>
                <div 
                  className="clock-hand hour-hand"
                  style={{ transform: `rotate(${hours}deg)` }}
                ></div>
                <div 
                  className="clock-hand minute-hand"
                  style={{ transform: `rotate(${minutes}deg)` }}
                ></div>
                <div 
                  className="clock-hand second-hand"
                  style={{ transform: `rotate(${seconds}deg)` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default Clock;