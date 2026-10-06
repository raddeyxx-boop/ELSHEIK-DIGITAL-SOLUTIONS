import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.resetModules();
});

function context(software = false) {
  const loseContext = vi.fn();
  const gl = {
    RENDERER: 1,
    getParameter: () => (software ? "SwiftShader" : "hardware GPU"),
    getExtension: (name: string) =>
      name === "WEBGL_lose_context" ? { loseContext } : null,
    isContextLost: () => false,
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    gl as unknown as WebGL2RenderingContext,
  );
  return { gl, loseContext };
}

it("uses one hardware context for the capability check and renderer", async () => {
  vi.useFakeTimers();
  const { loseContext } = context();
  const { preparePixelContext, acquirePixelContext } =
    await import("@/components/backgrounds/pixel-blast/webgl-context");
  const prepared = preparePixelContext();
  expect(acquirePixelContext()).toBe(prepared);
  expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(3000);
  expect(loseContext).not.toHaveBeenCalled();
});

it("releases an unclaimed context when navigation cancels renderer loading", async () => {
  vi.useFakeTimers();
  const { loseContext } = context();
  const { preparePixelContext } =
    await import("@/components/backgrounds/pixel-blast/webgl-context");
  preparePixelContext();
  vi.advanceTimersByTime(2000);
  expect(loseContext).toHaveBeenCalledTimes(1);
});

it("rejects software rendering once and releases its context", async () => {
  const { loseContext } = context(true);
  const { preparePixelContext } =
    await import("@/components/backgrounds/pixel-blast/webgl-context");
  expect(preparePixelContext()).toBeNull();
  expect(preparePixelContext()).toBeNull();
  expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledTimes(1);
  expect(loseContext).toHaveBeenCalledTimes(1);
});

it("retains the fallback when WebGL is unavailable", async () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  const { preparePixelContext } =
    await import("@/components/backgrounds/pixel-blast/webgl-context");
  expect(preparePixelContext()).toBeNull();
});
