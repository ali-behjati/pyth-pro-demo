import classes from "./AppV2.module.css";
import { Header } from "./components/Header";
import { PriceCards } from "./components/PriceCards";
import { PriceChart } from "./components/PriceChart";
// import { PriceChart } from "./components/PriceChart";

export function AppV2() {
  return (
    <div className={classes.root}>
      <Header />
      <main>
        <aside>
          <PriceCards />
        </aside>
        <article>
          <PriceChart />
        </article>
      </main>
    </div>
  );
}
