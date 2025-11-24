import classes from "./AppV2.module.css";
import { Header } from "./components/Header";

export function AppV2() {
  return (
    <div className={classes.root}>
      <Header />
    </div>
  );
}
