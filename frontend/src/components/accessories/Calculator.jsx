import { useState, useRef, useEffect, useCallback } from "react";
import Draggable from "react-draggable";
import "../../styles/accessories/_calculator.scss";

const Calculator = ({
  isOpen,
  isMinimized,
  onClose,
  onMinimize,
  onFocus,
  zIndex,
}) => {
  const nodeRef = useRef(null);
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputNumber = useCallback((num) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? String(num) : display + num);
    }
  }, [display, waitingForOperand]);

  const inputOperation = useCallback((nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  }, [display, previousValue, operation]);

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "×":
        return firstValue * secondValue;
      case "÷":
        return firstValue / secondValue;
      case "=":
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = useCallback(() => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  }, [display, previousValue, operation]);

  const clear = useCallback(() => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  }, []);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setIsFocused(true);
      setTimeout(() => {
        nodeRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e) => {
      if (!isFocused) return;
      
      const key = e.key;
      e.preventDefault();
      
      if (key >= '0' && key <= '9') {
        inputNumber(parseInt(key));
      } else if (key === '.') {
        inputNumber('.');
      } else if (key === '+') {
        inputOperation('+');
      } else if (key === '-') {
        inputOperation('-');
      } else if (key === '*') {
        inputOperation('×');
      } else if (key === '/') {
        inputOperation('÷');
      } else if (key === 'Enter' || key === '=') {
        performCalculation();
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFocused, inputNumber, inputOperation, performCalculation, clear]);

  if (!isOpen) return null;

  return (
    <Draggable
      handle=".window-titlebar"
      nodeRef={nodeRef}
      cancel=".titlebar-button"
    >
      <div
        ref={nodeRef}
        className="window calculator-window"
        onClick={() => {
          onFocus();
          setIsFocused(true);
          nodeRef.current?.focus();
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        tabIndex={0}
        style={{
          zIndex,
          outline: 'none',
          ...(isMinimized && { display: "none" }),
        }}
      >
        <div className="window-titlebar metal">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>🔢</span>
            <span>Calculator</span>
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
        <div className="calculator-content">
          <div className="calculator-display">{display}</div>
          <div className="calculator-buttons">
            <button className="calc-btn clear" onClick={clear}>C</button>
            <button className="calc-btn" onClick={() => inputOperation("÷")}>÷</button>
            <button className="calc-btn" onClick={() => inputOperation("×")}>×</button>
            <button className="calc-btn" onClick={() => inputOperation("-")}>-</button>
            
            <button className="calc-btn" onClick={() => inputNumber(7)}>7</button>
            <button className="calc-btn" onClick={() => inputNumber(8)}>8</button>
            <button className="calc-btn" onClick={() => inputNumber(9)}>9</button>
            <button className="calc-btn plus" onClick={() => inputOperation("+")} rowSpan="2">+</button>
            
            <button className="calc-btn" onClick={() => inputNumber(4)}>4</button>
            <button className="calc-btn" onClick={() => inputNumber(5)}>5</button>
            <button className="calc-btn" onClick={() => inputNumber(6)}>6</button>
            
            <button className="calc-btn" onClick={() => inputNumber(1)}>1</button>
            <button className="calc-btn" onClick={() => inputNumber(2)}>2</button>
            <button className="calc-btn" onClick={() => inputNumber(3)}>3</button>
            <button className="calc-btn equals" onClick={performCalculation} rowSpan="2">=</button>
            
            <button className="calc-btn zero" onClick={() => inputNumber(0)} colSpan="2">0</button>
            <button className="calc-btn" onClick={() => inputNumber(".")}>.</button>
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default Calculator;