import React, { useMemo } from 'react';
import Select from "react-select";

const StyledSelect = ({ isInline = false, ...props }) => {
  const baseStyles = useMemo(() => ({
    control: (base, state) => ({
      ...base,
      background: state.isFocused
        ? "rgba(255, 255, 255, 0.2)"
        : "rgba(255, 255, 255, 0.1)",
      border: state.isFocused
        ? "1px solid rgba(255, 255, 255, 0.4)"
        : "1px solid rgba(255, 255, 255, 0.3)",
      borderRadius: "4px",
      minHeight: isInline ? "24px" : "24px",
      height: "24px",
      fontSize: isInline ? "0.8rem" : "0.9rem",
      margin: "0px",
      textShadow: "0 0 3px rgba(0, 0, 0, 0.7)",
      boxShadow: state.isFocused
        ? "0 0 0 2px rgba(255, 255, 255, 0.5)"
        : "0 0 3px 0 rgba(0, 0, 0, 0.5)",
      "&:hover": {
        borderColor: state.isFocused
          ? "rgba(0, 0, 255, 0.8)"
          : "rgba(255, 255, 255, 0.35)",
      },
    }),
    menu: (base) => ({
      ...base,
      background: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(15px)",
      border: "1px solid rgba(255, 255, 255, 0.9)",
      borderRadius: "8px",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      zIndex: 10000,
      fontSize: isInline ? "0.8rem" : "0.9rem",
    }),
    option: (base, state) => ({
      ...base,
      background: state.isSelected
        ? "rgba(100, 150, 255, 0.8)"
        : state.isFocused
        ? "rgba(100, 150, 255, 0.5)"
        : "transparent",
      color: "white",
      fontSize: isInline ? "0.8rem" : "0.9rem",
      textShadow: "0 1px 3px rgba(0, 0, 0, 1)",
      "&:active": {
        background: "rgba(100, 150, 255, 0.6)",
      },
    }),
    multiValue: (base) => ({
      ...base,
      background: "rgba(100, 150, 255, 0.3)",
      borderRadius: "3px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "white",
      fontSize: isInline ? "0.7rem" : "0.8rem",
    }),
    placeholder: (base) => ({
      ...base,
      color: "rgba(255, 255, 255, 0.7)",
      fontSize: isInline ? "0.8rem" : "0.8rem",
      margin: "0px",
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
      color: "white",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: "0 8px",
      height: isInline ? "22px" : "22px",
      display: "flex",
      alignItems: "center",
    }),
    indicatorSeparator: (base) => ({
      ...base,
      height: isInline ? "22px" : "22px",
      alignSelf: "center",
      boxShadow: "0 -1px 2px rgba(0,0,0,0.2)",
      margin: "0",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: "22px",
      display: "flex",
      alignItems: "center",
    }),
    valueContainer: (base) => ({
      ...base,
      height: "22px",
      display: "flex",
      alignItems: "center",
      padding: "0 8px",
    }),
  }), [isInline]);

  const styles = useMemo(() => ({
    ...baseStyles,
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  }), [baseStyles]);

  return (
    <Select
      styles={styles}
      menuShouldBlockScroll={false}
      menuPortalTarget={document.body}
      {...props}
    />
  );
};

export default React.memo(StyledSelect);