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
import { Toaster, toast } from "solid-toast";

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
  });

  createEffect(() => {
    localStorage.setItem(
      "lastUsedState",
      JSON.stringify({
        time: Date.now(),
        playerState: players(),
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

  const [payments, setPayments] = createSignal<null | ReturnType<
    typeof consolidatePayments
  >>(null);

  const groupedPayments = createMemo<
    null | [string, ReturnType<typeof consolidatePayments>][]
  >(() => {
    const p = payments();
    if (!p) return null;
    return Object.entries(Object.groupBy(p, (payment) => payment.from)) as [
      string,
      ReturnType<typeof consolidatePayments>,
    ][];
  });

  const paymentsText = createMemo(() => {
    const gp = groupedPayments();
    if (!gp) return null;
    let result = ``;
    gp.forEach((arr) => {
      result += `## ${arr[0]}\n`;
      arr[1].forEach((payment) => {
        result += `${payment.from} pays ${payment.to}: ${payment.amount.toFixed(2)}\n`;
      });
      result += `\n`;
    });
    console.log(result);
    return result;
  });

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
    if (p.length === 0) return;
    setPayments(p);
  };

  const handleUpdateRow = (update: Partial<Player>, idx: number) => {
    console.log({ i: idx, update });
    setPlayers((l) => {
      const players = [...l];
      players[idx] = { ...players[idx], ...update };
      console.log({ players });
      return players;
    });
    console.log({ open: idx, players: players() });
  };

  const handleCopy = async () => {
    const p = paymentsText();
    console.log(p);
    if (!p) return;
    try {
      await navigator.clipboard.writeText(p);
      toast.success("Copied to clipboard");
    } catch (err) {
      console.error("error", err);
      toast.error("Error while copying");
    }
  };

  return (
    <>
      <Toaster position="bottom-right" gutter={8} />
      <div class="bg-slate-900 w-100 min-h-screen text-white">
        <div class="container mx-auto">
          <h1 class="py-12 text-2xl lg:text-3xl text-center font-bold">
            Cash Game
          </h1>
          <table class="max-w-11/12 mx-auto text-center">
            <thead
              class={cn("text-gray-300 font-semibold text-lg md:font-bold")}
            >
              <tr>
                <th class="p-2">Name</th>
                <th class="p-2">Buy in</th>
                <th class="p-2">End stack</th>
              </tr>
            </thead>
            <tbody>
              <For each={players()}>
                {(player, index) => (
                  <Player
                    player={player}
                    handleUpdateRow={handleUpdateRow}
                    idx={index()}
                  />
                )}
              </For>
              <tr>
                <td colspan="3" class="py-2">
                  <button class="active:opacity-35" onClick={handleAddPlayer}>
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
                matchingTotals()
                  ? "bg-orange-600 active:bg-orange-700"
                  : "bg-gray-200",
                "rounded-lg p-2",
              )}
              onClick={handleCalculate}
            >
              Calculate
            </button>
          </div>
          <Show when={groupedPayments() !== null}>
            <div class="relative border-white border-1 text-center w-72 mx-auto">
              <button
                class="z-10 absolute right-1 top-1 bg-black rounded-sm active:opacity-35"
                onClick={handleCopy}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width={1.5}
                  stroke="currentColor"
                  class="w-6 h-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                  />
                </svg>
              </button>
              <For each={groupedPayments()}>
                {(item) => (
                  <div class="flex flex-col w-72 mx-auto">
                    <span class="font-semibold py-2 self-start">{item[0]}</span>
                    {item[1].map((p) => (
                      <span>{`${p.from} pays ${p.to}: ${p.amount.toFixed(2)}`}</span>
                    ))}
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>
      </div>
    </>
  );
}

type PlayerValues = {
  name: string;
  buyin: number;
  end: number;
};

const Player: Component<{
  player: PlayerValues;
  handleUpdateRow: (update: Partial<Player>, idx: number) => void;
  idx: number;
}> = (props) => {
  return (
    <tr class="w-100 py-4">
      <td class="py-1">
        <fieldset class="w-100 flex justify-evenly">
          <input
            type="text"
            value={props.player.name}
            class="bg-slate-900 w-28 sm:w-40 text-center"
            onChange={(e) =>
              props.handleUpdateRow({ name: e.currentTarget.value }, props.idx)
            }
          />
        </fieldset>
      </td>
      <td>
        <fieldset class="w-100 flex justify-evenly">
          <input
            type="number"
            value={props.player.buyin.toFixed(2)}
            class="bg-slate-900 w-14 sm:w-20 text-center"
            onChange={(e) =>
              props.handleUpdateRow(
                {
                  buyin: Number(e.currentTarget.value),
                },
                props.idx,
              )
            }
          />
        </fieldset>
      </td>
      <td>
        <fieldset class="w-100 flex justify-evenly">
          <input
            type="number"
            value={props.player.end.toFixed(2)}
            class="bg-slate-900 w-14 sm:w-20 text-center"
            onChange={(e) =>
              props.handleUpdateRow(
                { end: Number(e.currentTarget.value) },
                props.idx,
              )
            }
          />
        </fieldset>
      </td>
    </tr>
  );
};

export default App;
