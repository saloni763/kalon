import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface AddLeadIconProps {
  width?: number;
  height?: number;
}

export default function AddLeadIcon({ 
  width = 86, 
  height = 86
}: AddLeadIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 86 86" fill="none">
      {/* Main circle - shadow effect will be handled by parent container styles */}
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M35.4021 20.8792C40.3995 19.7069 45.6006 19.7069 50.5978 20.8792C57.804 22.5695 63.4307 28.196 65.1209 35.4021C66.293 40.3995 66.293 45.6006 65.1209 50.5978C63.4307 57.804 57.804 63.4307 50.5978 65.1209C45.6006 66.293 40.3995 66.293 35.4021 65.1209C28.1961 63.4307 22.5695 57.804 20.8792 50.5981C19.7069 45.6006 19.7069 40.3995 20.8792 35.4021C22.5695 28.196 28.196 22.5695 35.4021 20.8792Z"
        fill="#7436D7"
      />
      {/* Plus icon */}
      <Path
        d="M51.4211 44.5789H44.5789V51.4211C44.5789 52.2842 43.8632 53 43 53C42.1368 53 41.4211 52.2842 41.4211 51.4211V44.5789H34.5789C33.7158 44.5789 33 43.8632 33 43C33 42.1368 33.7158 41.4211 34.5789 41.4211H41.4211V34.5789C41.4211 33.7158 42.1368 33 43 33C43.8632 33 44.5789 33.7158 44.5789 34.5789V41.4211H51.4211C52.2842 41.4211 53 42.1368 53 43C53 43.8632 52.2842 44.5789 51.4211 44.5789Z"
        fill="white"
      />
    </Svg>
  );
}

