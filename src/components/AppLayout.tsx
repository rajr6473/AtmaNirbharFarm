import React from 'react';
import { View } from 'react-native';
import AppHeader from './AppHeader';

const AppLayout = ({
  children,
  showBack = false,
}: {
  children: React.ReactNode;
  showBack?: boolean;
}) => {
  return (
    <View style={{ flex: 1 }}>
      <AppHeader showBack={showBack} />
      {children}
    </View>
  );
};

export default AppLayout;
