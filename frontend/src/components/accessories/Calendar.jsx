import { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import "../../styles/accessories/_calendar.scss";

const Calendar = ({
  isOpen,
  isMinimized,
  onClose,
  onMinimize,
  onFocus,
  zIndex,
}) => {
  const nodeRef = useRef(null);
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        nodeRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMinimized]);

  if (!isOpen) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isToday = (day) => {
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const renderCalendarDays = () => {
    const days = [];

    // Previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(
        <div
          key={`prev-${daysInPrevMonth - i}`}
          className="calendar-day prev-month"
        >
          {daysInPrevMonth - i}
        </div>
      );
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday(day) ? "today" : ""}`}
        >
          {day}
        </div>
      );
    }

    // Next month's leading days
    const totalCells = 42; // 6 rows × 7 days
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <div key={`next-${day}`} className="calendar-day next-month">
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <Draggable
      handle=".window-titlebar"
      nodeRef={nodeRef}
      cancel=".titlebar-button"
    >
      <div
        ref={nodeRef}
        className="window calendar-window"
        onClick={onFocus}
        tabIndex={0}
        style={{
          zIndex,
          outline: "none",
          ...(isMinimized && { display: "none" }),
        }}
      >
        <div className="window-titlebar">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>📅</span>
            <span>Calendar</span>
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
        <div className="calendar-content">
          <div className="calendar-header">
            <button className="btn nav-btn" onClick={prevMonth}>
              ‹
            </button>
            <div className="month-year">
              {monthNames[month]} {year}
            </div>
            <button className="btn nav-btn" onClick={nextMonth}>
              ›
            </button>
          </div>
          <div className="calendar-grid">
            {dayNames.map((day) => (
              <div key={day} className="day-header">
                {day}
              </div>
            ))}
            {renderCalendarDays()}
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default Calendar;
