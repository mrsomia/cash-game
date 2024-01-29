import { describe, expect, it } from "vitest";
import {
  consolidatePayments,
  getEqualBalances,
  getNextPayment,
} from "../../lib/consolidatePayments";

const input = [
  {
    name: "Moun",
    balance: -5,
  },
  {
    name: "Sandy",
    balance: 1,
  },
  {
    name: "Sach",
    balance: 4,
  },
];
const output = [
  {
    from: "Sach",
    to: "Moun",
    amount: 4,
  },
  {
    from: "Sandy",
    to: "Moun",
    amount: 1,
  },
];

describe("Consolidate Payments", () => {
  it("getEqualBalances returns expected payments", () => {
    const input = [
      {
        name: "Moun",
        balance: -5,
      },
      {
        name: "Jim",
        balance: -3,
      },
      {
        name: "Sandy",
        balance: 1,
      },
      {
        name: "Sam",
        balance: 2,
      },
      {
        name: "Sach",
        balance: 5,
      },
    ];
    const { equalPayments } = getEqualBalances(input);
    expect(equalPayments).toEqual([
      {
        from: "Sach",
        to: "Moun",
        amount: 5,
      },
    ]);
  });

  it("getEqualBalances returns an empty array when there are no equals", () => {
    const { equalPayments } = getEqualBalances(input);
    expect(equalPayments).toEqual([]);
  });

  it("splices the payments array correctly", () => {
    const input = [
      {
        name: "Moun",
        balance: -5,
      },
      {
        name: "Jim",
        balance: -3,
      },
      {
        name: "Sandy",
        balance: 1,
      },
      {
        name: "Sam",
        balance: 2,
      },
      {
        name: "Sach",
        balance: 5,
      },
    ];

    const output = [
      {
        name: "Jim",
        balance: -3,
      },
      {
        name: "Sandy",
        balance: 1,
      },
      {
        name: "Sam",
        balance: 2,
      },
    ];
    const { pbs } = getEqualBalances(input);
    expect(pbs).toEqual(output);
  });

  it.skip("Sets up an equal payment", () => {
    // For a 3 way payment
    // Search the array to find 2 values that add up to a single one
    const input = [
      {
        name: "Moun",
        balance: -4,
      },
      {
        name: "Jim",
        balance: -3,
      },
      {
        name: "Sandy",
        balance: 1,
      },
      {
        name: "Sam",
        balance: 2,
      },
      {
        name: "Tom",
        balance: 2,
      },
      {
        name: "Sach",
        balance: 2,
      },
    ];
  });

  it("Finds the next payment", () => {
    const input = [
      {
        name: "Moun",
        balance: -4,
      },
      {
        name: "Jim",
        balance: -3,
      },
      {
        name: "Sandy",
        balance: 1,
      },
      {
        name: "Sam",
        balance: 2,
      },
      {
        name: "Tom",
        balance: 2,
      },
      {
        name: "Sach",
        balance: 2,
      },
    ];

    const { nextPayments } = getNextPayment(input);
    expect(nextPayments).toEqual([
      {
        from: "Sach",
        to: "Moun",
        amount: 2,
      },
    ]);
  });

  it.skip("address payments correctly", () => {
    expect(consolidatePayments(input)).toEqual(output);
  });
});
