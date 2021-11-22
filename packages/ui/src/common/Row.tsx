import Flex, { OmittedDirectionFlexProps } from './Flex';

const Row = (props: OmittedDirectionFlexProps) => {
  return <Flex {...props} flexDirection="row" />;
};

export default Row;
