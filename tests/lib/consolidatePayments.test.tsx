import { describe, expect, it } from "vitest";
import {
  consolidatePayments,
  getEqualBalances,
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
  it("getEqualBalances returns expected equals", () => {
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
    expect(getEqualBalances(input)).toEqual([
      [
        {
          name: "Sach",
          balance: 5,
        },
        {
          name: "Moun",
          balance: -5,
        },
      ],
    ]);
  });
  it("getEqualBalances returns an empty array when there are no equals", () => {
    expect(getEqualBalances(input)).toEqual([]);
  });
  it("address payments correctly", () => {
    expect(consolidatePayments(input)).toEqual(output);
  });
});
