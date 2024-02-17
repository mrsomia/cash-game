import { For, Component } from "solid-js";
import "./App.css";
import { createStore } from "solid-js/store";

function App() {
  const [players, setPlayers] = createStore([
    {
      name: "Player 1",
      buyin: 0,
      end: 0,
    },
    {
      name: "Player 2",
      buyin: 0,
      end: 0,
    },
  ]);

  return (
    <div class="container bg-slate-900 w-100 min-h-screen text-white">
      <h1 class="py-12 text-2xl lg:text-3xl text-center font-bold">
        Cash Game
      </h1>
      <div class="w-10/12 mx-auto">
        <For each={players}>{(player) => <Player player={player} />}</For>
      </div>
    </div>
  );
}

type PlayerValues = {
  name: string;
  buyin: number;
  end: number;
};

const Player: Component<{ player: PlayerValues }> = (props) => {
  return (
    <div class="w-100 flex justify-between">
      <div class="block">{props.player.name}</div>
      <div class="block">{props.player.buyin.toFixed(2)}</div>
      <div class="block">{props.player.end.toFixed(2)}</div>
    </div>
  );
};

export default App;
