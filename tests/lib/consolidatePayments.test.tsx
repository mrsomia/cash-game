import { describe, expect, it } from "vitest";
import {
  consolidatePayments,
  findThreePersonPayment,
  getEqualBalances,
  getNextPayment,
} from "../../lib/consolidatePayments";

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

  it("Sets up an equal payment", () => {
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
    const output = [
      {
        from: "Sam",
        to: "Moun",
        amount: 2,
      },
      {
        from: "Tom",
        to: "Moun",
        amount: 2,
      },
    ];
    const result = findThreePersonPayment(input);
    expect(result).not.toBeNull();
    expect(result?.payments).toEqual(output);
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

  it("Find next payment splices the rest", () => {
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

    const { rest } = getNextPayment(input);
    expect(rest).toEqual([
      {
        name: "Moun",
        balance: -2,
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
    ]);
  });

  it("address simple mixed payments correctly", () => {
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
        from: "Sandy",
        amount: 1,
        to: "Moun",
      },
      {
        from: "Sach",
        amount: 4,
        to: "Moun",
      },
    ];

    expect(consolidatePayments(input)).toEqual(output);
  });

  it("handles unordered input", () => {
    const input = [
      {
        name: "Sach",
        balance: 4,
      },
      {
        name: "Sandy",
        balance: 1,
      },
      {
        name: "Moun",
        balance: -5,
      },
    ];
    const output = [
      {
        from: "Sandy",
        amount: 1,
        to: "Moun",
      },
      {
        from: "Sach",
        amount: 4,
        to: "Moun",
      },
    ];

    expect(consolidatePayments(input)).toEqual(output);
  });
});
