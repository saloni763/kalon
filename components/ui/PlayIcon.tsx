import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface PlayIconProps {
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export default function PlayIcon({ 
  width = 22, 
  height = 22, 
  color = '#AF7DFF',
  backgroundColor = 'white'
}: PlayIconProps) {
  return (
    <Svg 
      width={width} 
      height={height} 
      viewBox="0 0 22 22" 
      fill="none"
    >
      <Circle cx="11" cy="11" r="11" fill={backgroundColor} />
      <Path
        d="M15.6278 12.7358L9.99228 15.9561C8.65896 16.718 7 15.7553 7 14.2197V10.9993V7.77904C7 6.2434 8.65896 5.28066 9.99228 6.04256L15.6278 9.26286C16.9714 10.0307 16.9714 11.968 15.6278 12.7358Z"
        fill={color}
      />
    </Svg>
  );
}

