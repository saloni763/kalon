import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface StarIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export default function StarIcon({ 
  width = 39, 
  height = 26, 
  color = '#FFFFFF' 
}: StarIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 39 26" fill="none">
      <Path
        d="M13.4216 0L16.59 9.93115L39 4.94052L18.5482 16.0689L21.7166 26L13.4216 19.8623L5.12659 26L8.29499 16.0689L0 9.93115H10.2532L13.4216 0Z"
        fill={color}
      />
    </Svg>
  );
}

