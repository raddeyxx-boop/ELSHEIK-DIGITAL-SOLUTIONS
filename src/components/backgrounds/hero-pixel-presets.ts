import type { PixelBlastProps } from './pixel-blast/pixel-blast';

export type HeroPixelPreset = Required<Pick<PixelBlastProps,
  'variant' | 'pixelSize' | 'patternScale' | 'patternDensity' | 'pixelSizeJitter' |
  'enableRipples' | 'rippleSpeed' | 'rippleThickness' | 'rippleIntensityScale' |
  'liquid' | 'liquidStrength' | 'liquidRadius' | 'liquidWobbleSpeed' | 'speed' |
  'edgeFade' | 'noiseAmount' | 'transparent' | 'autoPauseOffscreen' | 'seed'>> & {
    opacity: number; mask: 'system' | 'edge' | 'data' | 'signal';
  };
const base: HeroPixelPreset = {
  variant: 'square', pixelSize: 5, patternScale: 3, patternDensity: .8,
  pixelSizeJitter: .2, enableRipples: true, rippleSpeed: .3, rippleThickness: .09,
  rippleIntensityScale: .8, liquid: false, liquidStrength: .025, liquidRadius: 1,
  liquidWobbleSpeed: 2, speed: .3, edgeFade: .35, noiseAmount: 0,
  transparent: true, autoPauseOffscreen: true, opacity: .34, mask: 'edge', seed: 32,
};
export const HERO_PIXEL_PRESETS = {
  home: { ...base, pixelSize: 4.5, patternDensity: .9, pixelSizeJitter: .25, speed: .35, rippleIntensityScale: 1, opacity: .48, mask: 'system', seed: 32 },
  services: { ...base, patternScale: 2.5, patternDensity: .75, pixelSizeJitter: .12, speed: .28, opacity: .34, seed: 48 },
  work: { ...base, variant: 'diamond', pixelSize: 4.5, patternDensity: 1, speed: .3, opacity: .4, seed: 64 },
  about: { ...base, pixelSize: 6, patternDensity: .6, speed: .22, edgeFade: .45, rippleIntensityScale: .55, opacity: .26, seed: 24 },
  insights: { ...base, pixelSize: 4, patternScale: 3.5, patternDensity: .8, speed: .25, opacity: .28, mask: 'data', seed: 56 },
  contact: { ...base, patternDensity: .65, speed: .25, rippleIntensityScale: 1.2, rippleThickness: .1, opacity: .38, mask: 'signal', seed: 40 },
  caseStudy: { ...base, patternScale: 2.7, patternDensity: .6, pixelSizeJitter: .15, speed: .24, edgeFade: .4, opacity: .26, seed: 48 },
} satisfies Record<string, HeroPixelPreset>;
export type HeroPixelPage = keyof typeof HERO_PIXEL_PRESETS;

export function responsivePixelPreset(page: HeroPixelPage, size: 'desktop' | 'tablet' | 'mobile'): HeroPixelPreset & { maxDpr: number } {
  const preset = HERO_PIXEL_PRESETS[page];
  const mobile = size === 'mobile', tablet = size === 'tablet';
  return { ...preset, pixelSize: preset.pixelSize + (mobile ? 1.5 : tablet ? .5 : 0),
    patternScale: preset.patternScale * (mobile ? 1.25 : 1),
    patternDensity: preset.patternDensity * (mobile ? .9 : tablet ? .94 : 1),
    speed: preset.speed * (mobile ? .75 : 1), opacity: preset.opacity * (mobile ? .85 : tablet ? .9 : 1),
    rippleIntensityScale: preset.rippleIntensityScale * (mobile ? .7 : 1),
    maxDpr: mobile ? 1 : 1.5,
  };
}
