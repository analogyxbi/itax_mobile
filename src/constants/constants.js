import Colors from "../../utils/Colors";
import ApiConfiguration from "../ApiConfiguration";
import { Icons } from "../components/Icons";
import Homepage from "../homepage/Homepage";
import ProfileSettings from "../profile/ProfileSettings";
import Users from "../users/Users";


export const constant = {
  SPACING: 16,
  borderRadius: 10,
  titleFontSize: 24,
  textFontSize: 16,
  subTextFontSize: 14,
}


export const ScreensArray = [
  { route: 'Home', label: 'Home', type: Icons.Ionicons, icon: 'home-outline', component: Homepage, },
  { route: 'Users', label: 'Users', type: Icons.Feather, icon: "users", component: Users, },
  { route: 'APIConfiguration', label: 'API Configuration', type: Icons.MaterialCommunityIcons, icon: "api", component: ApiConfiguration, },
];

export const drawerMenu = [
  {
    title: "Inventory",
    bg: Colors.menu1,
    type: Icons.Feather, icon: 'settings',
    route: 'Settings',
    menuList: [
      { title: 'Inventory Transfer', screen: 'inventory_transfer' },
      { title: 'Inventory Count', screen: 'inventory_count' },
      { title: 'Tracker', screen: 'po_reciept' },
      { title: 'Empty BIN', screen: 'po_reciept' },
    ]
  },
  {
    title: "Receiving",
    bg: Colors.menu2,
    type: Icons.Feather, icon: 'check-square',
    route: 'Todo',
    menuList: [
      { title: 'PO Receipt', screen: 'po_reciept' },
      { title: 'Container Arrival', screen: 'container_arrival' },
      { title: 'Container Receipt', screen: 'container_reciept' },
      { title: 'Mass Receipt', screen: 'mass_reciept' },
      { title: 'Job Receipt to Inventroy', screen: 'job_receipt_to_inven' },
    ]
  },
]