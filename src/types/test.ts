export type TestItem = {
  subject: string;
  name: string;
  text: string;
  url: string;
};

export type TestSubject = {
  subject: string;
  tests: TestItem[];
};

