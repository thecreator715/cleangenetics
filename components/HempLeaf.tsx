import React from 'react';
import { HEMP_LEAF_PATH, HEMP_LEAF_VEINS } from '../lib/hempLeafPath';

/**
 * Botanically-styled cannabis / hemp leaf: seven serrated lanceolate leaflets
 * (a centre leaflet, then pairs that step down in size) fanned from a single petiole.
 */
const HempLeaf: React.FC<{ className?: string; style?: React.CSSProperties; veins?: boolean; stem?: boolean }> = ({
  className,
  style,
  veins = false,
  stem = false,
}) => (
  <svg viewBox={stem ? '20 24 160 172' : '20 26 160 118'} fill="currentColor" className={className} style={style} aria-hidden>
    <path d={HEMP_LEAF_PATH} />
    {veins && <path d={HEMP_LEAF_VEINS} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.3" strokeLinecap="round" />}
  </svg>
);

export default HempLeaf;
