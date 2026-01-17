export type TestItem = {
  subject: string;
  subjectKey: string;
  name: string;
  text: string;
  url: string;
};

export type TestSubject = {
  subject: string;
  subjectKey: string;
  tests: TestItem[];
};

