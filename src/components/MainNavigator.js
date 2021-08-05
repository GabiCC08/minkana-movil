import React from "react";
import HomeScreen from "../screens/HomeScreen";
import { createStackNavigator } from "@react-navigation/stack";
import { Text, Button } from "react-native-ui-lib";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import StatisticsScreen from "../screens/StatisticsScreen";
import UserProfileScreen from "../screens/UserProfileScreen";
import EditUserProfileScreen from "../screens/EditUserProfileScreen";
import ReportScreen from "../screens/ReportScreen";
import NotificationScreen from "../screens/NotificationsScreen";
import { useAuth } from "../utils/auth";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const MainStackNavigator = ({ navigation }) => {
  const { user } = useAuth();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
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
      />
      <Stack.Screen
        name="Reportes"
        component={ReportScreen}
        options={{
          headerTitle: "Denuncias",
          headerStyle: {
            height: 100,
            backgroundColor: "#3D405B",
          },
          headerTitleStyle: {
            color: "white",
            fontSize: 25,
          },
          headerTintColor: "white",
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="Notificaciones"
        component={NotificationScreen}
        options={{
          headerTitle: "Notificaciones",
          headerStyle: {
            backgroundColor: "#3D405B",
            height: 100,
          },
          headerTitleStyle: {
            color: "white",
            fontSize: 25,
          },
          headerTintColor: "white",
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="Estadisticas"
        component={StatisticsScreen}
        options={{
          headerTitle: "Estadisticas",
          headerStyle: {
            backgroundColor: "#3D405B",
            height: 100,
          },
          headerTitleStyle: {
            color: "white",
            fontSize: 25,
          },
          headerTintColor: "white",
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ headerTitle: "Perfil", headerShown: false }}
      />
      <Stack.Screen
        name="EditUserProfile"
        component={EditUserProfileScreen}
        options={{ headerTitle: "Actualizar Perfil", headerShown: false }}
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
      <Drawer.Screen name="Perfil" component={UserProfileScreen} />
    </Drawer.Navigator>
  );
};

export default MainNavigator;
