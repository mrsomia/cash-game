import {
  For,
  Component,
  createSignal,
  Show,
  createMemo,
  createEffect,
} from "solid-js";
import { z } from "zod";
import { consolidatePayments } from "../lib/consolidatePayments";
import "./App.css";
import { cn } from "../lib/utils";

const playerSchema = z.object({
  name: z.string(),
  buyin: z.number(),
  end: z.number(),
});

type Player = z.infer<typeof playerSchema>;

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

  const savedStateSchema = z.object({
    time: z.number(),
    playerState: z.array(playerSchema),
  });

  createEffect(() => {
    const s = localStorage.getItem("lastUsedState");
    if (!s) return;

    let parsed;
    try {
      parsed = JSON.parse(s);
      parsed = savedStateSchema.passthrough().parse(parsed);
    } catch (e) {
      console.error("Incorrect state format", e);
      return;
    }

    // If older than 1 day ignore it
    if (Date.now() - parsed.time > 1 * 24 * 60 * 60 * 1000) {
      console.log("Saved state time too old");
      return;
    }
    setPlayers(parsed.playerState);
    setPayments(
      (parsed?.paymentState as ReturnType<typeof consolidatePayments>) ?? null,
    );
  });

  createEffect(() => {
    localStorage.setItem(
      "lastUsedState",
      JSON.stringify({
        time: Date.now(),
        playerState: players(),
        paymentState: payments(),
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

  const [payments, setPayments] = createSignal<null | ReturnType<
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
      <div class="container mx-auto">
        <h1 class="py-12 text-2xl lg:text-3xl text-center font-bold">
          Cash Game
        </h1>
        {/* <div class="flex justify-end mx-8 my-4"> */}
        {/*   <button */}
        {/*     class="font-semibold bg-orange-600 px-4 py-2 rounded-lg" */}
        {/*     onClick={handleAddPlayer} */}
        {/*   > */}
        {/*     + */}
        {/*   </button> */}
        {/* </div> */}
        <table class="w-10/12 mx-auto text-center">
          <thead class={cn("text-gray-300 font-semibold md:font-bold")}>
            <tr>
              <th class="py-2">Name</th>
              <th>Buy in</th>
              <th>End stack</th>
            </tr>
          </thead>
          <tbody>
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
            <tr>
              <td colspan="3" class="py-2">
                <button class="" onClick={handleAddPlayer}>
                  + Add Player
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th class="">
                <span>Totals</span>
              </th>
              <th>
                <span class={cn(matchingTotals() ? "" : "text-red-400")}>
                  {totalBuyin()}
                </span>
              </th>
              <th>
                <span class={cn(matchingTotals() ? "" : "text-red-400")}>
                  {totalEnd()}
                </span>
              </th>
            </tr>
          </tfoot>
        </table>
        <div class="p-4 flex justify-center">
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
        <Show when={payments() !== null}>
          <div class="border-white border-1 text-center">
            <For
              each={
                //@ts-expect-error
                Object.entries(Object.groupBy(payments(), (p) => p.from))
              }
            >
              {(item) => (
                <div class="flex flex-col w-72 mx-auto">
                  <span class="font-semibold py-2 self-start">{item[0]}</span>
                  {
                    //@ts-expect-error
                    item[1].map((p) => (
                      <span>{`${p.from} pays ${p.to}: ${p.amount.toFixed(2)}`}</span>
                    ))
                  }
                </div>
              )}
            </For>
          </div>
        </Show>
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
  handleUpdateRow: (update: Partial<Player>) => void;
}> = (props) => {
  return (
    <tr class="w-100 py-4">
      <td>
        <fieldset class="w-100 flex justify-evenly">
          <input
            type="text"
            value={props.player.name}
            class="bg-slate-900 w-28 text-center"
            onChange={(e) =>
              props.handleUpdateRow({ name: e.currentTarget.value })
            }
          />
        </fieldset>
      </td>
      <td>
        <fieldset class="w-100 flex justify-evenly">
          <input
            type="number"
            value={props.player.buyin.toFixed(2)}
            class="bg-slate-900 w-14 text-center"
            onChange={(e) =>
              props.handleUpdateRow({
                buyin: Number(e.currentTarget.value),
              })
            }
          />
        </fieldset>
      </td>
      <td>
        <fieldset class="w-100 flex justify-evenly">
          <input
            type="number"
            value={props.player.end.toFixed(2)}
            class="bg-slate-900 w-14 text-center"
            onChange={(e) =>
              props.handleUpdateRow({ end: Number(e.currentTarget.value) })
            }
          />
        </fieldset>
      </td>
    </tr>
  );
};

export default App;
