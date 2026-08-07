import { describe, expect, it } from "vitest";

import {
  detectGovernorate,
  matchShippingZone,
  normalizeEgyptianPhone,
  validateAddress,
  validateCustomerName,
  validateEgyptianPhone,
} from "@/lib/order-input-validation";

describe("validateCustomerName", () => {
  it("accepts two and three part human names", () => {
    expect(validateCustomerName("محمد أحمد").ok).toBe(true);
    expect(validateCustomerName("محمد أحمد علي").ok).toBe(true);
    expect(validateCustomerName("Ahmed Hassan Ali").ok).toBe(true);
  });

  it("rejects a single word, digits, symbols and empty values", () => {
    expect(validateCustomerName("محمد").ok).toBe(false);
    expect(validateCustomerName("محمد 123").ok).toBe(false);
    expect(validateCustomerName("@@@ ###").ok).toBe(false);
    expect(validateCustomerName("").ok).toBe(false);
  });

  it("ignores honorifics when counting the parts", () => {
    expect(validateCustomerName("استاذ محمد").ok).toBe(false);
    expect(validateCustomerName("استاذ محمد أحمد").ok).toBe(true);
  });
});

describe("egyptian phone", () => {
  it("normalizes local, international and arabic-digit forms", () => {
    expect(normalizeEgyptianPhone("01012345678")).toBe("01012345678");
    expect(normalizeEgyptianPhone("+201012345678")).toBe("01012345678");
    expect(normalizeEgyptianPhone("00201012345678")).toBe("01012345678");
    expect(normalizeEgyptianPhone("٠١٠١٢٣٤٥٦٧٨")).toBe("01012345678");
    expect(normalizeEgyptianPhone("010 1234-5678")).toBe("01012345678");
  });

  it("rejects incomplete and non-egyptian numbers", () => {
    expect(validateEgyptianPhone("0101234").ok).toBe(false);
    expect(validateEgyptianPhone("01312345678").ok).toBe(false);
    expect(validateEgyptianPhone("+96650123456").ok).toBe(false);
    expect(validateEgyptianPhone("01111111111").ok).toBe(false);
  });
});

describe("validateAddress", () => {
  it("rejects a governorate on its own", () => {
    const r = validateAddress("القاهرة");
    expect(r.ok).toBe(false);
    expect(r.missing).toContain("area");
  });

  it("accepts governorate + area + street", () => {
    const r = validateAddress("القاهرة - مدينة نصر - شارع مصطفى النحاس");
    expect(r.ok).toBe(true);
    expect(r.governorate).toBe("القاهرة");
  });

  it("does not require building or flat number", () => {
    expect(validateAddress("الجيزة الهرم شارع الملك فيصل").ok).toBe(true);
  });

  it("asks for the governorate when it is missing", () => {
    const r = validateAddress("شارع الجمهورية بجوار الصيدلية");
    expect(r.ok).toBe(false);
    expect(r.missing).toContain("governorate");
  });
});

describe("detectGovernorate", () => {
  it("resolves common city aliases", () => {
    expect(detectGovernorate("انا ساكن في المعادي")).toBe("القاهرة");
    expect(detectGovernorate("من طنطا")).toBe("الغربية");
  });
});

describe("matchShippingZone", () => {
  const zones = [
    { country: "مصر", region: "القاهرة", price: 50, currency: "EGP" },
    { country: "مصر", region: "الإسكندرية", price: 70, currency: "EGP" },
  ];

  it("infers the zone from the address", () => {
    expect(matchShippingZone(zones, ["القاهرة مدينة نصر شارع 10"]).zone?.price).toBe(50);
  });

  it("infers the zone from an earlier message", () => {
    expect(matchShippingZone(zones, ["", "انا من اسكندرية"]).zone?.price).toBe(70);
  });

  it("returns nothing when it cannot tell, instead of guessing", () => {
    expect(matchShippingZone(zones, ["مش عارف"]).zone).toBeNull();
  });

  it("uses the only zone when the store has just one", () => {
    const one = [{ country: "مصر", region: "كل المحافظات", price: 60, currency: "EGP" }];
    const m = matchShippingZone(one, ["مش عارف"]);
    expect(m.zone?.price).toBe(60);
    expect(m.fallbackSingleZone).toBe(true);
  });
});
