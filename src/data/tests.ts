import { TestSubject } from "../types/test";

export const testData: TestSubject[] = [
  {
    subject: "addition",
    subjectKey: "practicePage.subjects.addition",
    tests: [
      {
        subject: "addition",
        subjectKey: "practicePage.subjects.addition",
        name: "add-without-conversion",
        text: "practicePage.exercises.addWithoutConversion",
        url: "/practice/addition/add-without-conversion",
      },
      {
        subject: "addition",
        subjectKey: "practicePage.subjects.addition",
        name: "add-with-conversion",
        text: "practicePage.exercises.addWithConversion",
        url: "/practice/addition/add-with-conversion",
      },
    ],
  },
  {
    subject: "order-of-operations",
    subjectKey: "practicePage.subjects.orderOfOperations",
    tests: [
      {
        subject: "order-of-operations",
        subjectKey: "practicePage.subjects.orderOfOperations",
        name: "order-of-operations",
        text: "practicePage.exercises.orderOfOperations",
        url: "/practice/order-of-operations/order-of-operations",
      },
    ],
  },
  {
    subject: "fractions",
    subjectKey: "practicePage.subjects.fractions",
    tests: [
      {
        subject: "fractions",
        subjectKey: "practicePage.subjects.fractions",
        name: "fraction-addition",
        text: "practicePage.exercises.fractionAddition",
        url: "/practice/fractions/fraction-addition",
      },
      {
        subject: "fractions",
        subjectKey: "practicePage.subjects.fractions",
        name: "least-common-denominator",
        text: "practicePage.exercises.leastCommonDenominator",
        url: "/practice/fractions/least-common-denominator",
      },
      {
        subject: "fractions",
        subjectKey: "practicePage.subjects.fractions",
        name: "fraction",
        text: "practicePage.exercises.fraction",
        url: "/practice/fractions/fraction",
      },
    ],
  },
];

