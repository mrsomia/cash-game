import { For, Component, createSignal } from "solid-js";
import "./App.css";
import { createStore } from "solid-js/store";

function App() {
  const [players, _setPlayers] = createStore([
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

  const [openRow, setOpenRow] = createSignal<null | number>(null);

  const handleToggleRow = (index: number) => {
    if (openRow() == index) {
      setOpenRow(null);
    } else {
      setOpenRow(index);
    }
    console.log({ open: openRow() });
  };

  return (
    <div class="bg-slate-900 w-100 min-h-screen text-white">
      <div class="container">
        <h1 class="py-12 text-2xl lg:text-3xl text-center font-bold">
          Cash Game
        </h1>
        <div class="w-10/12 mx-auto text-center">
          <div class="w-100 flex justify-between py-4 px-2">
            <div>Name</div>
            <div class="pl-4">Buy in</div>
            <div>End stack</div>
            <div>
              <span> </span>
            </div>
          </div>
          <For each={players}>
            {(player, index) => (
              <Player
                player={player}
                open={index() == openRow()}
                setOpenRow={() => handleToggleRow(index())}
              />
            )}
          </For>
        </div>
      </div>
    </div>
  );
}

type PlayerValues = {
  name: string;
  buyin: number;
  end: number;
};

const Player: Component<{
  player: PlayerValues;
  open: boolean;
  setOpenRow: () => void;
}> = (props) => {
  return (
    <div class="w-100 flex justify-between">
      <div>{props.player.name}</div>
      <div>{props.player.buyin.toFixed(2)}</div>
      <div>{props.player.end.toFixed(2)}</div>
      <div onClick={props.setOpenRow}>+</div>
    </div>
  );
};

export default App;
