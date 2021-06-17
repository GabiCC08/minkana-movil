import React from "react";
import HomeScreen from "../screens/HomeScreen";
import { createStackNavigator } from "@react-navigation/stack";
import { Text, Button, View } from "react-native-ui-lib";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import TabBar from "./TabBar";
import RecipesScreen from "../screens/RecipesScreen";
import PlanScreen from "../screens/PlanScreen";
import StatisticsScreen from "../screens/StatisticsScreen";
import { useAuth } from "../utils/auth";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const MainStackNavigator = () => {
  const { user } = useAuth();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        options={({ navigation }) => ({
          headerTitleStyle: {
            display: "none",
          },
          headerRight: () => (
            <Text style={{ marginRight: 20 }}>Hola {user.name}</Text>
          ),
          headerLeft: () => (
            <Icon
              onPress={() => navigation.openDrawer()}
              name="bars"
              style={{ padding: 15 }}
              size={25}
              color="#000"
            />
          ),
        })}
      >
        {(props) => (
          <View main flex>
            <TabBar {...props} />
          </View>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="RecipesScreen"
        component={RecipesScreen}
        options={{ headerTitle: "Example 1" }}
      />
      <Stack.Screen
        name="PlanScreen"
        component={PlanScreen}
        options={{ headerTitle: "Example 1" }}
      />
      <Stack.Screen
        name="StatisticsScreen"
        component={StatisticsScreen}
        options={{ headerTitle: "Example 1" }}
      />
    </Stack.Navigator>
  );
};

const CustomDrawerContent = ({ ...props }) => {
  const { logout } = useAuth();
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        flex: 1,
        bottom: 0,
      }}
    >
      <DrawerItemList {...props} />
      <Button
        label="Cerrar sesión"
        style={{ position: "absolute", bottom: 10, alignSelf: "center" }}
        onPress={logout}
        link
      />
    </DrawerContentScrollView>
  );
};

const MainNavigator = ({ username, logoutAction }) => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <CustomDrawerContent logoutAction={logoutAction} {...props} />
      )}
    >
      <Drawer.Screen name="Inicio">
        {() => <MainStackNavigator username={username} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
};

export default MainNavigator;
