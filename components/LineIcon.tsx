import React from 'react';
import Svg, { Path, G, ClipPath, Defs, Rect } from 'react-native-svg';

interface LineIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export default function LineIcon({ 
  width = 92, 
  height = 8, 
  color = '#C2BA81' 
}: LineIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 92 8" fill="none">
      <G clipPath="url(#clip0_38_424)">
        <Path
          d="M74.95 7C69.6 7 69.6 1 64.25 1C58.9 1 58.9 7 53.55 7C48.2 7 48.19 1 42.84 1C37.49 1 37.49 7 32.13 7C26.77 7 26.78 1 21.42 1C16.06 1 16.07 7 10.71 7C5.35002 7 5.35 1 0 1"
          stroke={color}
          strokeWidth="2"
          strokeMiterlimit="10"
        />
      </G>
      <G clipPath="url(#clip1_38_424)">
        <Path
          d="M96.95 7C91.6 7 91.6 1 86.25 1C80.9 1 80.9 7 75.55 7C70.2 7 70.19 1 64.84 1C59.49 1 59.49 7 54.13 7C48.77 7 48.78 1 43.42 1C38.06 1 38.07 7 32.71 7C27.35 7 27.35 1 22 1"
          stroke={color}
          strokeWidth="2"
          strokeMiterlimit="10"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_38_424">
          <Rect width="74.95" height="8" fill="white" />
        </ClipPath>
        <ClipPath id="clip1_38_424">
          <Rect width="74.95" height="8" fill="white" transform="translate(22)" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

