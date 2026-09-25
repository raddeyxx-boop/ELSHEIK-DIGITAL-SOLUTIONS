'use client';

// Adapted from the React Bits Dock-JS-CSS registry; see Dock.SOURCE.md.
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, useReducedMotion, type MotionValue, type SpringOptions } from 'motion/react';
import { useRef, useState, type ReactNode } from 'react';
import './Dock.css';

export type DockEntry = { icon: ReactNode; label: string; href: string; active?: boolean };
type ItemProps = { item: DockEntry; mouseX: MotionValue<number>; spring: SpringOptions; distance: number; magnification: number; baseItemSize: number; reduced: boolean; dir: 'ltr' | 'rtl' };

function DockItem({ item, mouseX, spring, distance, magnification, baseItemSize, reduced, dir }: ItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const focused = useMotionValue(0);
  const mouseDistance = useTransform(mouseX, val => {
    const rect = ref.current?.getBoundingClientRect();
    return val - (rect?.x ?? 0) - (rect?.width ?? baseItemSize) / 2;
  });
  const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
  const focusSize = useTransform(() => focused.get() ? magnification : targetSize.get());
  const size = useSpring(focusSize, spring);
  return (
    <motion.div ref={ref} className="dock-item" style={{ width: reduced ? baseItemSize : size, height: reduced ? baseItemSize : size }}
      onHoverStart={() => setVisible(true)} onHoverEnd={() => setVisible(false)}>
      <Link href={item.href} aria-label={item.label} aria-current={item.active ? 'page' : undefined}
        onFocus={() => { setVisible(true); focused.set(1); }}
        onBlur={() => { setVisible(false); focused.set(0); }}
        onClick={() => { setVisible(false); focused.set(0); mouseX.set(Infinity); }}>
        <span className="dock-icon" aria-hidden="true">{item.icon}</span>
        <span className="dock-caption" aria-hidden="true">{item.label}</span>
      </Link>
      <AnimatePresence>
        {visible && <motion.span className="dock-label" dir={dir} aria-hidden="true"
          initial={{ opacity: reduced ? 1 : 0, y: 0 }} animate={{ opacity: 1, y: reduced ? 0 : -6 }}
          exit={{ opacity: 0, y: 0 }} transition={{ duration: reduced ? 0 : .15 }}>{item.label}</motion.span>}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Dock({ items, label, dir = 'ltr', spring = { mass: .1, stiffness: 150, damping: 12 },
  magnification = 58, distance = 120, panelHeight = 68, baseItemSize = 50,
}: { items: DockEntry[]; label: string; dir?: 'ltr' | 'rtl'; spring?: SpringOptions; magnification?: number; distance?: number; panelHeight?: number; baseItemSize?: number }) {
  const mouseX = useMotionValue(Infinity);
  const reduced = useReducedMotion() ?? false;
  return (
    <nav className="dock-outer" aria-label={label} dir={dir}>
      <div className="dock-panel" style={{ height: panelHeight }}
        onPointerMove={event => { if (event.pointerType === 'mouse' && !reduced) mouseX.set(event.clientX); }}
        onPointerLeave={() => mouseX.set(Infinity)}>
        {items.map(item => <DockItem key={item.href} item={item} mouseX={mouseX} spring={spring} distance={distance}
          magnification={magnification} baseItemSize={baseItemSize} reduced={reduced} dir={dir} />)}
      </div>
    </nav>
  );
}
