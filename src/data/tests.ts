import { TestSubject } from "../types/test";

export const testData: TestSubject[] = [
  {
    subject: "Addition",
    tests: [
      {
        subject: "Addition",
        name: "add-without-conversion",
        text: "practicePage.exercises.addWithoutConversion",
        url: "/practice/addition/add-without-conversion",
      },
      {
        subject: "Addition",
        name: "add-with-conversion",
        text: "practicePage.exercises.addWithConversion",
        url: "/practice/addition/add-with-conversion",
      },
    ],
  },
  {
    subject: "Order of Operations",
    tests: [
      {
        subject: "Order of Operations",
        name: "order-of-operations",
        text: "practicePage.exercises.orderOfOperations",
        url: "/practice/order-of-operations/order-of-operations",
      },
    ],
  },
  {
    subject: "Fractions",
    tests: [
      {
        subject: "Fractions",
        name: "fraction",
        text: "practicePage.exercises.fraction",
        url: "/practice/fractions/fraction",
      },
    ],
  },
];

