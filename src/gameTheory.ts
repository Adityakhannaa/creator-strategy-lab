export type Payoff = [number, number];
export type Matrix = [[Payoff, Payoff], [Payoff, Payoff]];
export type Scenario = {
  id: string; title: string; category: string; description: string; question: string;
  playerA: string; playerB: string; strategyA: [string, string]; strategyB: [string, string];
  matrix: Matrix; context: string; implication: string;
};

export const scenarios: Scenario[] = [
  {
    id: 'trend', title: 'The Trend Race', category: 'Reach vs. originality',
    description: 'Two creators decide whether to follow a fast-moving viral format or publish original work.',
    question: 'Does copying a trend create more value than standing out?',
    playerA: 'Creator A', playerB: 'Creator B', strategyA: ['Follow the trend', 'Publish original'], strategyB: ['Follow the trend', 'Publish original'],
    matrix: [[[4,4],[6,2]],[[2,6],[5,5]]],
    context: 'Trend-following can increase immediate discovery, but crowded formats split attention. Original work can build a distinctive audience when the other creator is chasing the same trend.',
    implication: 'A trend is not automatically the best choice. The payoff depends on whether the other creator also follows it and whether audiences reward novelty.'
  },
  {
    id: 'schedule', title: 'The Posting-Time Battle', category: 'Timing externality',
    description: 'Creators choose to publish during peak hours or in a quieter window with less competition.',
    question: 'Is the busiest audience window worth fighting over?',
    playerA: 'Creator A', playerB: 'Creator B', strategyA: ['Peak-time post', 'Quiet-window post'], strategyB: ['Peak-time post', 'Quiet-window post'],
    matrix: [[[3,3],[6,4]],[[4,6],[5,5]]],
    context: 'Peak time offers a larger audience but also more competing posts. A quieter window can offer better visibility if the rival occupies the peak slot.',
    implication: 'The best posting window is strategic, not universal. A creator should consider the competitor’s likely timing and their own audience analytics.'
  },
  {
    id: 'collab', title: 'Collaborate or Compete', category: 'Coordination',
    description: 'Two creators decide whether to collaborate on a shared piece or compete with separate content.',
    question: 'Can collaboration improve both creators’ outcomes?',
    playerA: 'Creator A', playerB: 'Creator B', strategyA: ['Collaborate', 'Go solo'], strategyB: ['Collaborate', 'Go solo'],
    matrix: [[[7,7],[2,5]],[[5,2],[4,4]]],
    context: 'A well-matched collaboration can combine audiences and production strengths. It also requires coordination and can feel less attractive if only one side contributes.',
    implication: 'Mutual collaboration can be the highest-value outcome, but trust and clear contribution rules matter because each creator can be tempted to go solo.'
  },
  {
    id: 'quality', title: 'Quality vs. Quantity', category: 'Resource allocation',
    description: 'Creators allocate effort to polished high-effort content or frequent lightweight posts.',
    question: 'Should a creator invest in fewer stronger posts or publish more often?',
    playerA: 'Creator A', playerB: 'Creator B', strategyA: ['High-effort content', 'Frequent posts'], strategyB: ['High-effort content', 'Frequent posts'],
    matrix: [[[6,6],[4,5]],[[5,4],[3,3]]],
    context: 'High-effort work can create stronger engagement and durable audience trust, while frequent posting increases opportunities for discovery but can dilute quality.',
    implication: 'When both creators focus on quality, the modeled value is highest. The model simplifies platform dynamics and does not claim one universal posting rule.'
  }
];

export function findPureNash(matrix: Matrix) {
  const equilibria: { row: number; col: number; payoff: Payoff }[] = [];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      const a = matrix[r][c][0];
      const b = matrix[r][c][1];
      const bestA = a >= matrix[1-r][c][0];
      const bestB = b >= matrix[r][1-c][1];
      if (bestA && bestB) equilibria.push({ row: r, col: c, payoff: matrix[r][c] });
    }
  }
  return equilibria;
}

export function bestResponses(matrix: Matrix) {
  const rowsForColumn = [0,1].map(c => {
    const a0 = matrix[0][c][0], a1 = matrix[1][c][0];
    return [a0 >= a1 ? 0 : -1, a1 >= a0 ? 1 : -1].filter(x => x >= 0);
  });
  const colsForRow = [0,1].map(r => {
    const b0 = matrix[r][0][1], b1 = matrix[r][1][1];
    return [b0 >= b1 ? 0 : -1, b1 >= b0 ? 1 : -1].filter(x => x >= 0);
  });
  return { rowsForColumn, colsForRow };
}

export function mixedEquilibrium(matrix: Matrix) {
  // p = probability A chooses row 0 making B indifferent; q = probability B chooses col 0 making A indifferent.
  const [a,b] = matrix[0];
  const [c,d] = matrix[1];
  const denominatorP = a[1] - b[1] - c[1] + d[1];
  const denominatorQ = a[0] - b[0] - c[0] + d[0];
  const p = denominatorP === 0 ? null : (d[1] - c[1]) / denominatorP;
  const q = denominatorQ === 0 ? null : (d[0] - b[0]) / denominatorQ;
  if (p === null || q === null || !Number.isFinite(p) || !Number.isFinite(q) || p < 0 || p > 1 || q < 0 || q > 1) return null;
  if (p === 0 || p === 1 || q === 0 || q === 1) return null;
  return { p, q };
}

export function isDominant(matrix: Matrix, player: 0 | 1, strategy: 0 | 1) {
  const other = 1 - strategy;
  for (let opponent = 0; opponent < 2; opponent++) {
    const selected = player === 0 ? matrix[strategy][opponent][0] : matrix[opponent][strategy][1];
    const alternative = player === 0 ? matrix[other][opponent][0] : matrix[opponent][other][1];
    if (selected < alternative) return false;
  }
  return true;
}
