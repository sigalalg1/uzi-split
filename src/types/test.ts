export type TestItem = {
  level: number;
  name: string;
  text: string;
  url: string;
};

export type TestLevel = {
  level: number;
  tests: TestItem[];
};

