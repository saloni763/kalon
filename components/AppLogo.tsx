import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface AppLogoProps {
  width?: number;
  height?: number;
}

export default function AppLogo({ 
  width = 36, 
  height = 53
}: AppLogoProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 36 53" fill="none">
      <Path
        d="M35.2246 35.1812L17.6777 0.131226V52.7281L35.2246 35.1812Z"
        fill="#382F59"
        stroke="white"
        strokeWidth="0.262547"
        strokeLinejoin="round"
      />
      <Path
        d="M0.130859 35.1812L17.6777 0.131226V52.7281L0.130859 35.1812Z"
        fill="#C5A1FF"
        stroke="white"
        strokeWidth="0.262547"
        strokeLinejoin="round"
      />
      <Path
        d="M17.6992 42.8555L31.9557 28.599"
        stroke="white"
        strokeWidth="0.262547"
        strokeLinejoin="round"
      />
      <Path
        d="M17.6777 42.8556L3.42246 28.6003"
        stroke="white"
        strokeWidth="0.262547"
        strokeLinejoin="round"
      />
      <Path
        d="M17.6992 33.0808L28.7094 22.0706"
        stroke="white"
        strokeWidth="0.262547"
      />
      <Path
        d="M17.6777 33.0808L6.66753 22.0706"
        stroke="white"
        strokeWidth="0.262547"
      />
      <Path
        d="M17.7051 24.0661L25.7122 16.059"
        stroke="white"
        strokeWidth="0.262547"
      />
      <Path
        d="M17.6836 24.0661L9.61028 15.9928"
        stroke="white"
        strokeWidth="0.262547"
      />
      <Path
        d="M17.6992 14.6821L22.5868 9.79456"
        stroke="white"
        strokeWidth="0.262547"
      />
      <Path
        d="M17.6797 14.6821L12.805 9.8075"
        stroke="white"
        strokeWidth="0.262547"
      />
    </Svg>
  );
}

