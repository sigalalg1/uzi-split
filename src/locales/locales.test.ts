import enTranslations from "./en.json";
import heTranslations from "./he.json";

describe("Locale translations", () => {
  const flattenObject = (
    obj: any,
    prefix = ""
  ): Record<string, any> => {
    return Object.keys(obj).reduce((acc: Record<string, any>, key: string) => {
      const prefixedKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(acc, flattenObject(obj[key], prefixedKey));
      } else {
        acc[prefixedKey] = obj[key];
      }
      return acc;
    }, {});
  };

  it("should have the same keys in English and Hebrew translations", () => {
    const enKeys = Object.keys(flattenObject(enTranslations));
    const heKeys = Object.keys(flattenObject(heTranslations));

    // Sort keys for better error messages
    enKeys.sort();
    heKeys.sort();

    expect(enKeys).toEqual(heKeys);
  });

  it("should have no missing keys in English", () => {
    const enFlat = flattenObject(enTranslations);
    const heFlat = flattenObject(heTranslations);

    const heKeys = Object.keys(heFlat);
    const missingInEn = heKeys.filter((key) => !(key in enFlat));

    expect(missingInEn).toEqual([]);
  });

  it("should have no missing keys in Hebrew", () => {
    const enFlat = flattenObject(enTranslations);
    const heFlat = flattenObject(heTranslations);

    const enKeys = Object.keys(enFlat);
    const missingInHe = enKeys.filter((key) => !(key in heFlat));

    expect(missingInHe).toEqual([]);
  });

  it("should have no empty translation values in English", () => {
    const enFlat = flattenObject(enTranslations);
    const emptyKeys = Object.entries(enFlat)
      .filter(([_, value]) => !value || (typeof value === "string" && value.trim() === ""))
      .map(([key]) => key);

    expect(emptyKeys).toEqual([]);
  });

  it("should have no empty translation values in Hebrew", () => {
    const heFlat = flattenObject(heTranslations);
    const emptyKeys = Object.entries(heFlat)
      .filter(([_, value]) => !value || (typeof value === "string" && value.trim() === ""))
      .map(([key]) => key);

    expect(emptyKeys).toEqual([]);
  });

  it("should have consistent structure between English and Hebrew", () => {
    const getStructure = (obj: any, prefix = ""): string[] => {
      return Object.keys(obj).reduce((acc: string[], key: string) => {
        const prefixedKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
          acc.push(`${prefixedKey}:object`);
          acc.push(...getStructure(obj[key], prefixedKey));
        } else {
          acc.push(`${prefixedKey}:${typeof obj[key]}`);
        }
        return acc;
      }, []);
    };

    const enStructure = getStructure(enTranslations).sort();
    const heStructure = getStructure(heTranslations).sort();

    expect(enStructure).toEqual(heStructure);
  });
});

