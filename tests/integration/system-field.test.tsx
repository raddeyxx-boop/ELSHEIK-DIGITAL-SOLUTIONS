import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { SystemField } from "@/components/motion/system-field";

let visibility: ((entries: { isIntersecting: boolean }[]) => void) | undefined;
const disconnect = vi.fn();
const animation = { pause: vi.fn(), play: vi.fn(), cancel: vi.fn(), currentTime: 0 as number | null, playState: "running" };
const animate = vi.fn(() => animation);

beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("IntersectionObserver", class { constructor(callback: typeof visibility) { visibility = callback; } observe() {} disconnect = disconnect; });
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  Object.assign(SVGElement.prototype, { getScreenCTM: () => ({ a: 0.5, d: 0.5, e: 10, f: 20 }), getTotalLength: () => 720, getPointAtLength: (at: number) => ({ x: at, y: 260 }) });
  Object.assign(HTMLElement.prototype, { animate });
});
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); visibility = undefined; });

it("moves the packet along the route with a compositor animation that pauses offscreen", () => {
  const { container, unmount } = render(<SystemField locale="en" />);
  expect(container.querySelector("animateMotion")).toBeNull();
  const [frames, timing] = animate.mock.calls[0] as unknown as [Keyframe[], KeyframeAnimationOptions];
  expect(frames).toHaveLength(121);
  expect(timing).toEqual({ duration: 4600, iterations: Infinity });
  expect(frames.every(frame => String(frame.transform).startsWith("translate("))).toBe(true);
  act(() => visibility?.([{ isIntersecting: false }]));
  expect(animation.pause).toHaveBeenCalledTimes(1);
  act(() => visibility?.([{ isIntersecting: true }]));
  expect(animation.play).toHaveBeenCalledTimes(1);
  unmount();
  expect(animation.cancel).toHaveBeenCalled();
  expect(disconnect).toHaveBeenCalled();
});

it("renders no packet and starts nothing under reduced motion", () => {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: true, media: query, addEventListener() {}, removeEventListener() {} }));
  const { container } = render(<SystemField locale="ar" />);
  expect(container.querySelector('[class*="packet"]')).toBeNull();
  expect(animate).not.toHaveBeenCalled();
  expect(visibility).toBeUndefined();
});
