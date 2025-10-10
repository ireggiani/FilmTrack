import React, { useMemo } from "react";
import Select from "react-select";

const StyledSelect = ({ isInline = false, ...props }) => {
  const baseStyles = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        background: state.isFocused
          ? "linear-gradient(180deg, rgb(159,159,159), rgb(210,210,210))"
          : "linear-gradient(0deg, rgb(159,159,159), rgb(210,210,210))",
        border: state.isFocused
          ? "1px solid rgb(100, 153, 201)"
          : "1px solid rgb(126,126,126)",
        borderRadius: "4px",
        boxSizing: "border-box",
        color: "rgb(121, 121, 121)",
        minHeight: isInline ? "24px" : "24px",
        height: "24px",
        fontSize: isInline ? "0.8rem" : "0.8rem",
        margin: "0px",
        boxShadow: "0 1px 0 rgb(206, 206, 206)",
        "&:hover": {
          borderColor: "rgb(100, 153, 201)",
        },
      }),
      menu: (base) => ({
        ...base,
        background: "rgba(255,255,255,0.95)",
        border: "1px solid rgb(196,196,196)",
        borderRadius: "8px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        zIndex: 10000,
        fontSize: "0.8rem",
      }),
      option: (base, state) => ({
        ...base,
        background: state.isSelected
          ? "rgba(100, 150, 255, 0.8)"
          : state.isFocused
          ? "linear-gradient(0deg, #2e5eec, #6688f4)"
          : "transparent",
        color: state.isFocused ? "white" : "black",
        fontSize: "0.8rem",
        fontWeight: state.isFocused ? "bold" : "normal",
        padding: "0 0.5rem",
      }),
      multiValue: (base) => ({
        ...base,
        background: "linear-gradient(0deg,rgb(151, 151, 151),rgb(158,158,158))",
        borderRadius: "12px",
        boxShadow: "inset 0 1px 1px rgb(82,82,82)",
        padding: "0",
        margin: "0",
      }),
      multiValueLabel: (base) => ({
        ...base,
        color: "white",
        fontSize: isInline ? "0.7rem" : "0.8rem",
        fontWeight: "bold",
        padding: "0",
      }),
      multiValueRemove: (base) => ({
        ...base,
        borderRadius: "50%",
        color: "white",
        paddingLeft: "2px",
        paddingRight: "2px",
        "&:hover": {
          background: "rgb(82,82,82)",
          color: "white",
        },
      }),
      clearIndicator: (base) => ({
        ...base,
        color: "rgb(118,118,118)",
      }),
      placeholder: (base) => ({
        ...base,
        color: "rgb(82,82,82)",
        fontSize: "0.8rem",
        fontWeight: "bold",
        margin: "0px",
      }),
      input: (base) => ({
        ...base,
        margin: 0,
        padding: 0,
        color: "rgb(121, 121, 121)",
      }),
      dropdownIndicator: (base) => ({
        ...base,
        color: "rgb(118,118,118)",
        padding: "0 8px",
        height: isInline ? "22px" : "22px",
        display: "flex",
        alignItems: "center",
      }),
      indicatorSeparator: (base) => ({
        ...base,
        height: isInline ? "22px" : "22px",
        alignSelf: "center",
        boxShadow: "0 -1px 2px rgb(118,118,118)",
        margin: "0",
        background: "rgb(118,118,118)",
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
    }),
    [isInline]
  );

  const styles = useMemo(
    () => ({
      ...baseStyles,
      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    }),
    [baseStyles]
  );

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
