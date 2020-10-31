import styled from 'styled-components/native';

export interface SpaceProps {
  width?: number;
  height?: number;
}

const Space = styled.View<SpaceProps>`
  ${(p) => (p.width ? `width: ${p.width.toFixed()}px;` : '')}
  ${(p) => (p.height ? `height: ${p.height.toFixed()}px;` : '')}
`;

export default Space;
