import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "math-field": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          ref?: React.Ref<HTMLElement>;
          placeholder?: string;
          "math-virtual-keyboard-policy"?: "auto" | "manual" | "sandboxed";
          "default-mode"?: "math" | "text" | "inline-math";
        },
        HTMLElement
      >;
    }
  }
  interface Window {
    mathVirtualKeyboard?: {
      layouts?: unknown;
      visible?: boolean;
      show?: () => void;
      hide?: () => void;
    };
  }
}

export {};