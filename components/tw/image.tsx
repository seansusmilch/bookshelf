import { useCssElement } from "react-native-css";
import React from "react";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { Image as RNImage } from "expo-image";

const AnimatedExpoImage = Animated.createAnimatedComponent(RNImage);

export type ImageProps = React.ComponentProps<typeof Image>;

function CSSImage(props: any) {
  const { objectFit, objectPosition, ...style } =
    StyleSheet.flatten(props.style) as {
      objectFit?: string;
      objectPosition?: string;
    } || {};

  return (
    <AnimatedExpoImage
      contentFit={objectFit as any}
      contentPosition={objectPosition as any}
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
