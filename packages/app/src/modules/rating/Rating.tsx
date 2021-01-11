import React, { useCallback, useState } from 'react';

import { Row } from '@workspace/ui';

import Star from './Star';

export interface RatingProps {
  initialRating?: number;
  onFinishRating?(rating: number): void;
  size?: number;
  disabled?: boolean;
  fixedValue?: number;
}

// @TODO - add not integer rating
const Rating = ({ initialRating = 3, fixedValue, onFinishRating, ...props }: RatingProps) => {
  const [rating, setRating] = useState(initialRating);

  const handleRatingChange = useCallback(
    (position) => {
      if (typeof onFinishRating === 'function') {
        onFinishRating(position);
      }

      setRating(position);
    },
    [onFinishRating],
  );

  return (
    <Row align="center">
      {[1, 2, 3, 4, 5].map((_star, index) => (
        <Star
          key={index}
          position={index + 1}
          fill={(fixedValue || rating) >= index + 1}
          index={index}
          handleRatingChange={handleRatingChange}
          {...props}
        />
      ))}
    </Row>
  );
};

export default Rating;
