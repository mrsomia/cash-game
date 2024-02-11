import { createSignal } from "solid-js";
import "./App.css";

function App() {
  const [count, setCount] = createSignal(0);

  return <h1 class="text-3xl font-bold underline">Hello world!</h1>;
}

export default App;
