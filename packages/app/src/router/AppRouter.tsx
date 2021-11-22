import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Suspense } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from 'styled-components';

import BookDetails from '../modules/book/BookDetails';
import Home from '../modules/home/Home';
import HomeShimmer from '../modules/home/HomeShimmer';
import Language from '../modules/language/Language';
import Library from '../modules/library/Library';
import LibraryShimmer from '../modules/library/LibraryShimmer';
import EditProfile from '../modules/profile/EditProfile';
import Profile from '../modules/profile/Profile';
import ProfileShimmer from '../modules/profile/ProfileShimmer';
import Reading from '../modules/reading/Reading';
import ReviewAdd from '../modules/review/ReviewAdd';
import ReviewEdit from '../modules/review/ReviewEdit';
import ReviewList from '../modules/review/ReviewList';
import Search from '../modules/search/Search';
import SearchShimmer from '../modules/search/SearchShimmer';

const Tab = createBottomTabNavigator();

const HomeSuspense = () => {
  return (
    <Suspense fallback={<HomeShimmer />}>
      <Home />
    </Suspense>
  );
};

const SearchSuspense = () => {
  return (
    <Suspense fallback={<SearchShimmer />}>
      <Search />
    </Suspense>
  );
};

const LibrarySuspense = () => {
  return (
    <Suspense fallback={<LibraryShimmer />}>
      <Library />
    </Suspense>
  );
};

const ProfileSuspense = () => {
  return (
    <Suspense fallback={<ProfileShimmer />}>
      <Profile />
    </Suspense>
  );
};

const AppTabs = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          let iconName = '';

          if (route.name === 'Home') {
            iconName = 'ios-home-outline';
          } else if (route.name === 'Search') {
            iconName = 'ios-search-outline';
          } else if (route.name === 'Library') {
            iconName = 'ios-book-outline';
          } else if (route.name === 'Profile') {
            iconName = 'ios-person-outline';
          }

          return <Ionicons name={iconName} size={28} color={color} />;
        },
      })}
      tabBarOptions={{
        activeTintColor: theme.colors.primary,
        inactiveTintColor: theme.colors.c3,
        showLabel: false,
        keyboardHidesTabBar: true,
      }}
    >
      <Tab.Screen name="Home" component={HomeSuspense} />
      <Tab.Screen name="Search" component={SearchSuspense} />
      <Tab.Screen name="Library" component={LibrarySuspense} />
      <Tab.Screen name="Profile" component={ProfileSuspense} />
    </Tab.Navigator>
  );
};

const Stack = createStackNavigator();

const App = () => {
  return (
    <Stack.Navigator screenOptions={{ headerBackTitle: '', headerShown: false }} mode="modal">
      <Stack.Screen name="App" component={AppTabs} />
      <Stack.Screen name="Book" component={BookDetails} />
      <Stack.Screen name="Reading" component={Reading} />
      <Stack.Screen name="ReviewAdd" component={ReviewAdd} />
      <Stack.Screen name="ReviewEdit" component={ReviewEdit} />
      <Stack.Screen name="ReviewList" component={ReviewList} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="Language" component={Language} />
    </Stack.Navigator>
  );
};

export default App;
