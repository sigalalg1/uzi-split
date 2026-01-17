import { TestLevel } from "../types/test";

export const testData: TestLevel[] = [
  {
    level: 10,
    tests: [
      {
        level: 10,
        name: "add-without-conversion",
        text: "Addition Without Conversion",
        url: "/test/10/add-without-conversion",
      },
      {
        level: 10,
        name: "add-with-conversion",
        text: "Addition With Conversion",
        url: "/test/10/add-with-conversion",
      },
    ],
  },
  {
    level: 13,
    tests: [
      {
        level: 13,
        name: "fraction",
        text: "Shaded Area - Fractions, Decimals & Percentages",
        url: "/test/13/fraction",
      },
    ],
  },
];

