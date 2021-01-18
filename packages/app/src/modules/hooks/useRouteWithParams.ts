import { RouteProp, useRoute } from '@react-navigation/native';

const useRouteWithParams = <T = any>() => {
  const route = useRoute<RouteProp<Record<string, T>, string>>();

  return route;
};

export default useRouteWithParams;
