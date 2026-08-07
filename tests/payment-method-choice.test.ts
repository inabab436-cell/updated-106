import { describe, expect, it } from "vitest";
import { verifyPaymentMethodChoice } from "@/lib/order-data-verification";

describe("verifyPaymentMethodChoice", () => {
  it("rejects an assumed cash-on-delivery method", () => {
    expect(
      verifyPaymentMethodChoice({
        methodName: "الدفع عند الاستلام",
        customerMessages: ["يلا", "تمام", "اه", "لا"],
      }),
    ).toBe(false);
  });

  it("accepts the method the customer named", () => {
    expect(
      verifyPaymentMethodChoice({
        methodName: "فودافون كاش",
        customerMessages: ["هدفع فودافون كاش"],
      }),
    ).toBe(true);
    expect(
      verifyPaymentMethodChoice({
        methodName: "الدفع عند الاستلام",
        customerMessages: ["عند الاستلام"],
      }),
    ).toBe(true);
    expect(
      verifyPaymentMethodChoice({
        methodName: "إنستا باي",
        customerMessages: ["instapay"],
      }),
    ).toBe(true);
  });

  it("does not confuse two wallet methods", () => {
    expect(
      verifyPaymentMethodChoice({
        methodName: "اتصالات كاش",
        customerMessages: ["فودافون كاش"],
      }),
    ).toBe(false);
  });
});
