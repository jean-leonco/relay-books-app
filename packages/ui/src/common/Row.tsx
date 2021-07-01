import Flex, { OmittedDirectionFlexProps } from './Flex';

const Row = (props: OmittedDirectionFlexProps) => {
  return <Flex {...props} direction="row" />;
};

export default Row;
