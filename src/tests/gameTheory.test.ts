import { describe, expect, it } from 'vitest';
import { bestResponses, findPureNash, isDominant, mixedEquilibrium, type Matrix } from '../gameTheory';

describe('pure Nash equilibrium detection', () => {
  it('finds both equilibria in a coordination game', () => {
    const matrix: Matrix = [[[3, 3], [0, 0]], [[0, 0], [2, 2]]];
    expect(findPureNash(matrix)).toEqual([
      { row: 0, col: 0, payoff: [3, 3] },
      { row: 1, col: 1, payoff: [2, 2] },
    ]);
  });

  it('finds no pure equilibrium in matching pennies', () => {
    const matrix: Matrix = [[[1, -1], [-1, 1]], [[-1, 1], [1, -1]]];
    expect(findPureNash(matrix)).toEqual([]);
  });

  it('treats ties as best responses, so every cell is an equilibrium in a constant-payoff game', () => {
    const matrix: Matrix = [[[2, 2], [2, 2]], [[2, 2], [2, 2]]];
    expect(findPureNash(matrix)).toHaveLength(4);
    expect(bestResponses(matrix)).toEqual({
      rowsForColumn: [[0, 1], [0, 1]],
      colsForRow: [[0, 1], [0, 1]],
    });
  });
});

describe('dominant strategies', () => {
  it('detects a strictly dominant strategy for either player', () => {
    const matrix: Matrix = [[[4, 3], [4, 1]], [[2, 4], [2, 2]]];
    expect(isDominant(matrix, 0, 0)).toBe(true);
    expect(isDominant(matrix, 0, 1)).toBe(false);
    expect(isDominant(matrix, 1, 0)).toBe(true);
    expect(isDominant(matrix, 1, 1)).toBe(false);
  });

  it('recognizes weak dominance when payoffs tie in some cases', () => {
    const matrix: Matrix = [[[3, 2], [3, 1]], [[3, 0], [2, 4]]];
    expect(isDominant(matrix, 0, 0)).toBe(true);
  });
});

describe('mixed-strategy equilibrium', () => {
  it('returns 50/50 probabilities for matching pennies', () => {
    const matrix: Matrix = [[[1, -1], [-1, 1]], [[-1, 1], [1, -1]]];
    expect(mixedEquilibrium(matrix)).toEqual({ p: 0.5, q: 0.5 });
  });

  it('returns null when the interior candidate is outside the probability range', () => {
    const matrix: Matrix = [[[4, 4], [3, 2]], [[2, 3], [1, 1]]];
    expect(mixedEquilibrium(matrix)).toBeNull();
  });

  it('returns null for degenerate games where an interior solution is not uniquely identified', () => {
    const matrix: Matrix = [[[1, 1], [1, 1]], [[1, 1], [1, 1]]];
    expect(mixedEquilibrium(matrix)).toBeNull();
  });
});
