import React from 'react';
import {
  ReactCompareSlider,
  ReactCompareSliderImage
} from 'react-compare-slider';

interface ImageComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  position?: number;
}

const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
  position = 50
}) => {
  return (
    <div className="my-8 w-full">
      <ReactCompareSlider
        itemOne={
          <ReactCompareSliderImage
            src={beforeImage}
            alt={beforeLabel}
            style={{ objectFit: 'contain' }}
          />
        }
        itemTwo={
          <ReactCompareSliderImage
            src={afterImage}
            alt={afterLabel}
            style={{ objectFit: 'contain' }}
          />
        }
        position={position}
        className="rounded-lg shadow-2xl border border-comfy-border overflow-hidden"
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '600px'
        }}
      />
      {(beforeLabel || afterLabel) && (
        <div className="flex justify-between mt-3 text-sm text-comfy-muted px-2">
          <span className="italic">{beforeLabel}</span>
          <span className="italic">{afterLabel}</span>
        </div>
      )}
    </div>
  );
};

export default ImageComparisonSlider;
