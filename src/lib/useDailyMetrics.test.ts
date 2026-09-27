import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDailyMetrics } from "./useDailyMetrics";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const jsonResponse = (body: unknown, init: ResponseInit = {}) => new Response(JSON.stringify(body), {
  status: 200,
  headers: { "Content-Type": "application/json" },
  ...init,
});

describe("useDailyMetrics", () => {
  it("loads metrics and averages on mount", async () => {
    const metrics = [{ date: "2026-01-01" }];
    const averages = { steps: 100, moveCalories: 0, restMinutes: 0, breatheMinutes: 0 };
    fetchMock.mockResolvedValueOnce(jsonResponse({ metrics, averages }));

    const { result } = renderHook(() => useDailyMetrics());
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.metrics).toEqual(metrics);
    expect(result.current.averages).toEqual(averages);
    expect(result.current.error).toBeNull();
  });

  it("sets an error message when the fetch response is not ok", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: "Database unavailable" }, { status: 503 }));

    const { result } = renderHook(() => useDailyMetrics());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Database unavailable");
  });

  it("migrates legacy localStorage imports before loading metrics", async () => {
    const legacyMetrics = [{ date: "2026-01-01" }];
    window.localStorage.setItem("baseline.importedMetrics.v1", JSON.stringify(legacyMetrics));

    fetchMock
      .mockResolvedValueOnce(jsonResponse({ inserted: 1 }, { status: 201 })) // migration POST
      .mockResolvedValueOnce(jsonResponse({ metrics: [], averages: { steps: 0, moveCalories: 0, restMinutes: 0, breatheMinutes: 0 } })); // GET

    const { result } = renderHook(() => useDailyMetrics());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/metrics", expect.objectContaining({ method: "POST" }));
    expect(window.localStorage.getItem("baseline.importedMetrics.v1")).toBeNull();
  });

  it("refresh() triggers a new load cycle", async () => {
    const averages = { steps: 0, moveCalories: 0, restMinutes: 0, breatheMinutes: 0 };
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ metrics: [], averages }))
      .mockResolvedValueOnce(jsonResponse({ metrics: [{ date: "2026-01-02" }], averages }));

    const { result } = renderHook(() => useDailyMetrics());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.refresh();
    });
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.metrics).toEqual([{ date: "2026-01-02" }]);
  });
});
