import {
  For,
  Component,
  createSignal,
  Show,
  createMemo,
  createEffect,
} from "solid-js";
import { consolidatePayments } from "../lib/consolidatePayments";
import "./App.css";
import { cn } from "../lib/utils";

type Player = {
  name: string;
  buyin: number;
  end: number;
};
function App() {
  const initialPlayers = [
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
  ];
  const [players, setPlayers] = createSignal(initialPlayers);

  createEffect(() => {
    const s = localStorage.getItem("lastUsedState");
    if (!s) return;
    const parsed = JSON.parse(s);
    // TODO:validateShape
    // TODO:validateTime
    setPlayers(parsed.state);
  });

  createEffect(() => {
    localStorage.setItem(
      "lastUsedState",
      JSON.stringify({
        time: new Date(),
        state: players(),
      }),
    );
  });

  const totalBuyin = createMemo(() => {
    return players()
      .reduce((acc, p) => acc + p.buyin, 0)
      .toFixed(2);
  });

  const totalEnd = createMemo(() => {
    return players()
      .reduce((acc, p) => acc + p.end, 0)
      .toFixed(2);
  });

  const matchingTotals = createMemo(() => totalBuyin() === totalEnd());

  const [openRow, setOpenRow] = createSignal<null | number>(null);

  const [_payments, setPayments] = createSignal<null | ReturnType<
    typeof consolidatePayments
  >>(null);

  const handleToggleRow = (index: number) => {
    if (openRow() == index) {
      setOpenRow(null);
    } else {
      setOpenRow(index);
    }
    console.log({ open: openRow() });
  };

  const handleAddPlayer = () => {
    setPlayers((prev) => [
      ...prev,
      {
        name: `Player ${prev.length + 1}`,
        buyin: 0,
        end: 0,
      },
    ]);
  };

  const handleCalculate = () => {
    const balances = players().map((p) => ({
      name: p.name,
      balance: p.buyin - p.end,
    }));
    const p = consolidatePayments(balances);
    // TODO: remove console.log
    console.log("payments", p);
    setPayments(p.sort((a, b) => a.from.localeCompare(b.from)));
  };

  const handleUpdateRow = (update: Partial<Player>) => {
    if (openRow() === null) return;
    console.log({ i: openRow(), update });
    setPlayers((l) => {
      const players = [...l];
      players[openRow()!] = { ...players[openRow()!], ...update };
      console.log({ players });
      return players;
    });
    console.log({ open: openRow(), players: players() });
  };

  return (
    <div class="bg-slate-900 w-100 min-h-screen text-white">
      <div class="container">
        <h1 class="py-12 text-2xl lg:text-3xl text-center font-bold">
          Cash Game
        </h1>
        <div class="w-10/12 mx-auto text-center">
          <div class="flex justify-end">
            <button
              class="font-semibold bg-orange-600 px-4 py-2 rounded-lg"
              onClick={handleAddPlayer}
            >
              +
            </button>
          </div>
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
          <For each={players()}>
            {(player, index) => (
              <Player
                player={player}
                open={index() === openRow()}
                setOpenRow={() => handleToggleRow(index())}
                handleUpdateRow={handleUpdateRow}
              />
            )}
          </For>
          <div class="flex justify-between">
            <div>
              <span>Totals</span>
            </div>
            <div>
              <span class={cn(matchingTotals() ? "" : "text-red-400")}>
                {totalBuyin()}
              </span>
            </div>
            <div>
              <span class={cn(matchingTotals() ? "" : "text-red-400")}>
                {totalEnd()}
              </span>
            </div>
            <div>
              <span> </span>
            </div>
          </div>
          <div class="p-4 w-100">
            <button
              class={cn(
                matchingTotals() ? "bg-orange-600" : "bg-gray-200",
                "rounded-lg p-2",
              )}
              onClick={handleCalculate}
            >
              Calculate
            </button>
          </div>
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
  handleUpdateRow: (update: Partial<Player>) => void;
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
              onChange={(e) =>
                props.handleUpdateRow({ name: e.currentTarget.value })
              }
            />
          </fieldset>
          <fieldset class="w-100 flex justify-evenly">
            <label>Buy In</label>
            <input
              type="number"
              value={props.player.buyin.toFixed(2)}
              class="bg-slate-900"
              onChange={(e) =>
                props.handleUpdateRow({
                  buyin: Number(e.currentTarget.value),
                })
              }
            />
          </fieldset>
          <fieldset class="w-100 flex justify-evenly">
            <label>Ending Stack</label>
            <input
              type="number"
              value={props.player.end.toFixed(2)}
              class="bg-slate-900"
              onChange={(e) =>
                props.handleUpdateRow({ end: Number(e.currentTarget.value) })
              }
            />
          </fieldset>
        </form>
        <div onClick={props.setOpenRow}>+</div>
      </div>
    </Show>
  );
};

export default App;
