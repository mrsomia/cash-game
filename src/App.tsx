import { For, Component, createSignal, Show } from "solid-js";
import "./App.css";
import { createStore } from "solid-js/store";
import { cn } from "../lib/utils";

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

  // const handleUpdateRow = (
  //   index: number,
  //   update: Partial<(typeof players)[number]>,
  // ) => {
  //   _setPlayers()
  // };

  return (
    <div class="bg-slate-900 w-100 min-h-screen text-white">
      <div class="container">
        <h1 class="py-12 text-2xl lg:text-3xl text-center font-bold">
          Cash Game
        </h1>
        <div class="w-10/12 mx-auto text-center">
          <div
            class={cn(
              "w-100 flex justify-between py-4 px-1 ",
              "text-gray-300 font-semibold md:font-bold",
            )}
          >
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
                open={index() === openRow()}
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

const ClosedPlayer: Component<{
  player: PlayerValues;
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

const Player: Component<{
  player: PlayerValues;
  open: boolean;
  setOpenRow: () => void;
}> = (props) => {
  return (
    <Show
      when={props.open}
      fallback={
        <ClosedPlayer player={props.player} setOpenRow={props.setOpenRow} />
      }
    >
      <div class="w-100 py-4">
        <form class=" flex-col justify-between">
          <fieldset class="w-100 flex justify-evenly">
            <label>Name</label>
            <input
              type="text"
              value={props.player.name}
              class="bg-slate-900"
              disabled
            />
          </fieldset>
          <fieldset class="w-100 flex justify-evenly">
            <label>Buy In</label>
            <input
              type="number"
              value={props.player.buyin.toFixed(2)}
              class="bg-slate-900"
            />
          </fieldset>
          <fieldset class="w-100 flex justify-evenly">
            <label>Ending Stack</label>
            <input
              type="number"
              value={props.player.end.toFixed(2)}
              class="bg-slate-900"
            />
          </fieldset>
        </form>
        <div onClick={props.setOpenRow}>+</div>
      </div>
    </Show>
  );
};

export default App;
