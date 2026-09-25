import fs from 'node:fs';
let source=fs.readFileSync('.artifacts/pixelblast/upstream.tsx','utf8');
source=source.slice(0,source.indexOf('const MAX_CLICKS = 10;'));
source='"use client";\n// Adapted from React Bits PixelBlast (David Haz). See LICENSE.md and SOURCE.md.\n'+source;
source=source.replace("import './PixelBlast.css';", "import styles from './pixel-blast.module.css';");
source=source.replace(/interface ReinitConfig \{[\s\S]*?\}\n/, '');
source=source.replace('type PixelBlastProps = {', 'export type PixelBlastProps = {\n  maxDpr?: number;\n  seed?: number;');
fs.writeFileSync('src/components/backgrounds/pixel-blast/pixel-blast.tsx',source);
