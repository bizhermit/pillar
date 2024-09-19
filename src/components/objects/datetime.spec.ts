import { DateTime } from "./datetime";

describe("datetime", () => {
  describe("new DateTime", () => {
    it("yyyy", () => {
      const dt = new DateTime("2024");
      expect(dt.toDateString()).toBe("2024-01-01");
      expect(dt.toTimeString()).toBe("00:00:00");
    });

    it("yyyyMM", () => {
      const dt = new DateTime("202402");
      expect(dt.toDateString()).toBe("2024-02-01");
      expect(dt.toTimeString()).toBe("00:00:00");
    });

    it("yyyy-MM", () => {
      const dt = new DateTime("2024-03");
      expect(dt.toDateString()).toBe("2024-03-01");
      expect(dt.toTimeString()).toBe("00:00:00");
    });

    it("yyyy-M", () => {
      const dt = new DateTime("2024-3");
      expect(dt.toDateString()).toBe("2024-03-01");
      expect(dt.toTimeString()).toBe("00:00:00");
    });

    it("yyyy/MM", () => {
      const dt = new DateTime("2024/03");
      expect(dt.toDateString()).toBe("2024-03-01");
      expect(dt.toTimeString()).toBe("00:00:00");
    });

    it("yyyy/M", () => {
      const dt = new DateTime("2024/3");
      expect(dt.toDateString()).toBe("2024-03-01");
      expect(dt.toTimeString()).toBe("00:00:00");
    });

    it("yyyyMMdd", () => {
      const dt = new DateTime("20240307");
      expect(dt.toDateString()).toBe("2024-03-07");
      expect(dt.toTimeString()).toBe("00:00:00");
    });

    it("yyyy-MM-dd", () => {
      const dt = new DateTime("2024-03-07");
      expect(dt.toDateString()).toBe("2024-03-07");
      expect(dt.toTimeString()).toBe("00:00:00");
    });

    it("yyyy/MM/dd", () => {
      const dt = new DateTime("2024/03/07");
      expect(dt.toDateString()).toBe("2024-03-07");
      expect(dt.toTimeString()).toBe("00:00:00");
    });
  });

  describe("timezone", () => {
    it("Asia/Tokyo", () => {
      const dt = new DateTime("2024-01-01T12:00:00+09:00");
      expect(dt.toString()).toBe("2024-01-01T12:00:00.000+09:00");
    });

    it("set Asia/Tokyo", () => {
      const dt = new DateTime("2024-01-01T12:00:00Z");
      dt.setTimezone("Asia/Tokyo");
      expect(dt.toString()).toBe("2024-01-01T21:00:00.000+09:00");
    });

    it("set LA", () => {
      const dt = new DateTime("2024-01-01T12:00:00Z");
      dt.setTimezone("America/Los_Angeles");
      expect(dt.toString()).toBe("2024-01-01T04:00:00.000-08:00");
    });
  });
});
