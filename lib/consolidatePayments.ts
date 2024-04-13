type PaymentBalance = {
  name: string;
  balance: number;
};

type Payment = {
  from: string;
  to: string;
  amount: number;
};

export function consolidatePayments(paymentBalances: PaymentBalance[]) {
  // throw error if balance do not add to zero
  const total = paymentBalances.reduce((acc, pb) => pb.balance + acc, 0);
  if (total !== 0) {
    throw new Error("Expected balances to equal 0");
  }

  paymentBalances.sort((a, b) => a.balance - b.balance);
  let payments: Payment[] = [];

  // splice out 0 balance values
  paymentBalances = paymentBalances.filter((pb) => pb.balance !== 0);

  // Check if there are any items that match in size
  while (paymentBalances.length > 0) {
    let { equalPayments, pbs } = getEqualBalances(paymentBalances);
    paymentBalances = pbs;
    payments = payments.concat(equalPayments);
    if (equalPayments.length) {
      continue;
    }

    let result = findThreePersonPayment(paymentBalances);
    if (result) {
      payments = payments.concat(result.payments);
      paymentBalances = result.rest;
      continue;
    }

    // Check for ways to set up a payment/clear a payment
    // cycle through payment balances for any one balance clearing items
    let { nextPayments, rest } = getNextPayment(paymentBalances);
    paymentBalances = rest;
    payments = payments.concat(nextPayments);
  }
  return payments;
}

export function findThreePersonPayment(paymentBalances: PaymentBalance[]) {
  let pbs = structuredClone(paymentBalances);
  let pb: PaymentBalance;
  let items: [number, number] | null = null;
  for (let i = 0; i < pbs.length; i++) {
    pb = pbs[i];
    // @ts-ignore
    const rest: PaymentBalance[] = pbs.toSpliced(i, 1);
    items = findTwoEquallingValues(rest, pb.balance);
    if (!items) continue;

    // create payments
    let payments: Payment[];
    if (pb.balance < 0) {
      payments = items.map((item) => ({
        to: pb.name,
        from: rest[item].name,
        amount: rest[item].balance,
      }));
    } else {
      payments = items.map((item) => ({
        from: pb.name,
        to: rest[item].name,
        amount: rest[item].balance,
      }));
    }
    // splice rest
    for (const item of items.reverse()) {
      rest.splice(item, 1);
    }
    // return
    return { payments, rest };
  }
  return null;
}

export function findTwoEquallingValues(
  paymentBalances: PaymentBalance[],
  value: number,
  // TS won't infer a tuple, just a num[]
): [number, number] | null {
  for (let i = 0; i < paymentBalances.length; i++) {
    for (let j = 0; j < paymentBalances.length; j++) {
      if (i === j) continue;
      const totalTogether =
        paymentBalances[i].balance + paymentBalances[j].balance;
      if (Math.abs(totalTogether) === Math.abs(value)) {
        return [i, j];
      }
    }
  }
  return null;
}

export function getNextPayment(paymentBalances: PaymentBalance[]) {
  const pbs = structuredClone(paymentBalances);
  let [first, ...rest] = pbs;
  if (first.balance >= 0) {
    throw new Error("Expected balance of first item to be negative");
  }
  let payment: Payment | null = null;
  for (let i = rest.length - 1; i >= 0; i--) {
    const item = rest[i];
    if (Math.abs(first.balance) < item.balance) {
      continue;
    }
    payment = {
      from: item.name,
      to: first.name,
      amount: item.balance,
    };
    first.balance = first.balance + item.balance;
    rest.splice(i, 1);
    break;
  }
  if (!payment) {
    throw new Error("Could not find a suitable payment");
  }
  return { nextPayments: [payment], rest: [first, ...rest] };
}

export function getEqualBalances(paymentBalances: PaymentBalance[]) {
  // Returns an array of equal payments and a spliced payment balance array
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

  // convert equalPayments to a payments object
  // {from: string; to: string, amount: number}
  const payments = equalPayments.map((ePayment) => ({
    from: ePayment[1].name,
    to: ePayment[0].name,
    amount: ePayment[1].balance, // May need a math.abs here
  }));
  return { equalPayments: payments, pbs };
}
