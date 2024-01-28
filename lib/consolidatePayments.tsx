type PaymentBalance = {
  name: string;
  balance: number;
};

export function consolidatePayments(paymentBalances: PaymentBalance[]) {
  // TODO:: throw error if balance do not add to zero

  paymentBalances.sort((a, b) => a.balance - b.balance);
  console.log(paymentBalances);

  // Check if there are any items that match in size
  const { equalPayments, pbs } = getEqualBalances(paymentBalances);
  paymentBalances = pbs;

  // convert equalPayments to a payments object {from: string; to: string, amount: number}
  const payments = equalPayments.map((ePayment) => ({
    from: ePayment[0].name,
    to: ePayment[1].name,
    amount: ePayment[0].balance, // May need a math.abs here
  }));

  // Remove items in equalPayments from paymentBalances
  // cycle through payment balances for any one balance clearing items
}

export function getEqualBalances(paymentBalances: PaymentBalance[]) {
  const pbs = structuredClone(paymentBalances);
  let left = 0;
  let right = pbs.length - 1;
  const equalPayments: PaymentBalance[][] = [];
  while (left < right) {
    const rightItem = pbs[right];
    const leftItem = pbs[left];

    if (rightItem.balance + leftItem.balance === 0) {
      equalPayments.push([leftItem, rightItem]);
      pbs.splice(right, 1);
      pbs.splice(left, 1);
      // if (right >= pbs.length) {
      right = right - 2;
      // }
      continue;
    }
    if (Math.abs(leftItem.balance) > Math.abs(rightItem.balance)) {
      right--;
      continue;
    }
    if (Math.abs(rightItem.balance) > Math.abs(leftItem.balance)) {
      left++;
      continue;
    }
  }
  return { equalPayments, pbs };
}
