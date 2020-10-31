import React, { useCallback, useState } from 'react';

import { Row } from '@booksapp/ui';

import Star from './Star';

export interface RatingProps {
  initialRating?: number;
  onFinishRating?(rating: number): void;
  size?: number;
  disabled?: boolean;
}

// @TODO - add not integer rating
const Rating = ({ initialRating = 3, onFinishRating, ...props }: RatingProps) => {
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
      {[1, 2, 3, 4, 5].map((star, index) => (
        <Star
          key={index}
          position={index + 1}
          fill={rating >= index + 1}
          handleRatingChange={handleRatingChange}
          {...props}
        />
      ))}
    </Row>
  );
};

export default Rating;
