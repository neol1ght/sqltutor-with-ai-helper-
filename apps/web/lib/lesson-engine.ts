/** Result shape for SQL results returned by the NestJS API. */
export type RunResult =
    | { status: 'error'; message: string; ms: number }
    | {
          status: 'success' | 'wrong' | 'correct';
          columns: string[];
          rows: (string | number | null)[][];
          feedback: string;
          ms: number;
      };
