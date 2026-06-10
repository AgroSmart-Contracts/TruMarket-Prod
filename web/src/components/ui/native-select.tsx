import * as React from "react";

import { cn } from "src/lib/utils";
import { tmFormControlNativeSelectClassName } from "src/lib/form-control-styles";

export interface NativeSelectProps extends React.ComponentPropsWithoutRef<"select"> {
  invalid?: boolean;
}

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, invalid, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(tmFormControlNativeSelectClassName({ invalid }), className)}
      {...props}
    />
  ),
);
NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
