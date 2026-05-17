import { Id } from "./convex/_generated/dataModel";

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  Scanner: undefined;
  ScanResult: {
    barcodeData: string;
    userId: Id<"users">;
  };
  ItemDetail: {
    itemId: Id<"items">;
    userId: Id<"users">;
  };
  BookFacility: {
    facilityId: Id<"facilities">;
    facilityName: string;
    capacity: number;
    userId: Id<"users">;
  };
  History: undefined;
};

export type TabParamList = {
  Home: undefined;
  Items: undefined;
  Bookings: undefined;
  Admin: undefined;
  Profile: undefined;
};
