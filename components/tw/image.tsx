import { useCssElement } from "react-native-css";
import React from "react";
import { StyleSheet, Image as RNImage } from "react-native";
import Animated from "react-native-reanimated";

const AnimatedImage = Animated.createAnimatedComponent(RNImage);

export type ImageProps = React.ComponentProps<typeof RNImage>;

function CSSImage(props: any) {
  const { resizeMode, ...style } =
    StyleSheet.flatten(props.style) as {
      resizeMode?: any;
    } || {};

  return (
    <AnimatedImage
      resizeMode={resizeMode}
      {...props}
      source={
        typeof props.source === "string" ? { uri: props.source } : props.source
      }
      style={style}
    />
  );
}

export const Image = (
  props: any & { className?: string }
) => {
  return useCssElement(CSSImage, props, { className: "style" });
};

Image.displayName = "CSS(Image)";
