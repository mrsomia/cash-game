type PaymentBalance = {
  name: string;
  balance: number;
};

export function consolidatePayments(paymentBalances: PaymentBalance[]) {
  // TODO:: throw error if balance do not add to zero

  paymentBalances.sort((a, b) => a.balance - b.balance);
  console.log(paymentBalances);

  // Check if there are any items that match in size
  // let left = 0;
  // let right = paymentBalances.length - 1;
  // const equals: PaymentBalance[][] = [];
  // while (left < right) {
  //   const rightItem = paymentBalances[left];
  //   const leftItem = paymentBalances[right];

  //   if (rightItem.balance + leftItem.balance === 0) {
  //     equals.push([leftItem, rightItem]);
  //     right--;
  //     left++;
  //     continue;
  //   }
  //   if (Math.abs(leftItem.balance) > Math.abs(rightItem.balance)) {
  //     right--;
  //     continue;
  //   }
  //   if (Math.abs(leftItem.balance) > Math.abs(rightItem.balance)) {
  //     right--;
  //     continue;
  //   }
  // }
}

export function getEqualBalances(paymentBalances: PaymentBalance[]) {
  let left = 0;
  let right = paymentBalances.length - 1;
  const equals: PaymentBalance[][] = [];
  while (left < right) {
    const rightItem = paymentBalances[right];
    const leftItem = paymentBalances[left];

    if (rightItem.balance + leftItem.balance === 0) {
      equals.push([leftItem, rightItem]);
      right--;
      left++;
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
  return equals;
}
