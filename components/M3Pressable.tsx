import React from 'react';
import { Pressable, PressableProps, Animated, StyleProp, ViewStyle, View } from 'react-native';

interface M3PressableProps extends PressableProps {
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  children: React.ReactNode | ((state: { pressed: boolean }) => React.ReactNode);
}

export const M3Pressable: React.FC<M3PressableProps> = ({ style, children, ...props }) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = (event: any) => {
    Animated.timing(scale, {
      toValue: 0.96,
      duration: 80,
      useNativeDriver: true,
    }).start();
    if (props.onPressIn) props.onPressIn(event);
  };

  const handlePressOut = (event: any) => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 80,
      useNativeDriver: true,
    }).start();
    if (props.onPressOut) props.onPressOut(event);
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
      style={(pressState) => {
        const resolvedStyle = typeof style === 'function' ? style(pressState) : style;
        return [resolvedStyle];
      }}
    >
      {(pressState) => {
        const resolvedChildren = typeof children === 'function' ? children(pressState) : children;
        return (
          <Animated.View style={{ transform: [{ scale }], width: '100%', alignItems: 'stretch' }}>
            {resolvedChildren}
          </Animated.View>
        );
      }}
    </Pressable>
  );
};
