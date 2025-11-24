import { Toolbar } from "primereact/toolbar";

import classes from "./Header.module.css";
import { ThemeSwitcher } from "../ThemeSwitchers";

export function Header() {
  return (
    <Toolbar
      className={classes.root}
      end={
        <>
          <ThemeSwitcher />
        </>
      }
      start={<>Pyth - Realtime feed comparison tool</>}
    />
  );
}
