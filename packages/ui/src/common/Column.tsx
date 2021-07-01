import { useMemo } from 'react';
import { css } from 'styled-components/native';

import Flex, { OmittedDirectionFlexProps } from './Flex';

interface ColumnProps extends OmittedDirectionFlexProps {
  span?: number;
}

const Column = ({ span, css: containerCss, ...props }: ColumnProps) => {
  const flexCss = useMemo(
    () =>
      span
        ? css`
            width: ${(span * 100) / 24}%;
            ${containerCss}
          `
        : containerCss,
    [containerCss, span],
  );

  return <Flex {...props} direction="column" css={flexCss} />;
};

export default Column;
