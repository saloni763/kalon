import React from 'react';
import { SvgProps } from 'react-native-svg';
import { StyleProp, ViewStyle } from 'react-native';

interface SvgIconProps extends SvgProps {
  source: React.FC<SvgProps>;
  width?: number;
  height?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Simple wrapper component for SVG icons
 * Usage: <SvgIcon source={AppLogo} width={50} height={50} />
 */
export default function SvgIcon({
  source: SvgComponent,
  width = 24,
  height = 24,
  color,
  style,
  ...props
}: SvgIconProps) {
  return (
    <SvgComponent
      width={width}
      height={height}
      color={color}
      style={style}
      {...props}
    />
  );
}

