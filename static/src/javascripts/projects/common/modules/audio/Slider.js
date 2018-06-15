//@flow

import { styled, Component } from '@guardian/dotcom-rendering/packages/guui';

const Scrubber = styled('div')(({ left }) => ({
  backgroundColor: '#ffffff',
  border: '2px solid #000000',
  borderRadius: '100%',
  height: '12px',
  left: `${left}px`,
  position: 'absolute',
  top: '50%', 
  transform: 'translate(-50%, -50%)',
  width: '12px',
}));

export default function Slider({ min, max, value }) {
  return (
    <Scrubber 
      left={value}
      role="slider" 
      aria-valuenow={value} 
      aria-valuemin={min} 
      aria-valuemax={max}
      />
  );
}
