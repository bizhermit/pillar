import DateTime from "./datetime";

describe("datetime", () => {
  const dt = new DateTime();
  const date = new Date();

  it("year", () => {
    expect(dt.getYear()).toBe(date.getFullYear());
  });

});
