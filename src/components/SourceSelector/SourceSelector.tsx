import classes from "./SourceSelector.module.css";
import { useAppStateContext } from "../../context";
import type { AllowedCryptoSymbolsType } from "../../types";
import { GROUPED_SOURCE_SELECTOR_OPTS } from "../../types";

const NO_SELECTION_VAL = "No selection";

export function SourceSelector() {
  /** context */
  const { handleSelectSource, selectedSource } = useAppStateContext();

  return (
    <div className={classes.sourceSelectorRoot}>
      <select
        id="source-selector"
        onChange={(e) => {
          handleSelectSource(e.target.value as AllowedCryptoSymbolsType);
        }}
        value={selectedSource ?? NO_SELECTION_VAL}
      >
        <optgroup label="Ungrouped">
          <option value={NO_SELECTION_VAL}>Select a source</option>
        </optgroup>
        {Object.entries(GROUPED_SOURCE_SELECTOR_OPTS).map(
          ([groupName, opts]) => (
            <optgroup key={groupName} label={groupName}>
              {opts?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </optgroup>
          ),
        )}
      </select>
    </div>
  );
}
