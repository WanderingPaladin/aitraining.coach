import type { MouseEvent, PointerEvent } from 'react';

export function pressProps(onPress: () => void) {
  return {
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0) return;
      event.preventDefault();
      onPress();
    },
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      if (event.detail !== 0) return;
      onPress();
    },
  };
}
