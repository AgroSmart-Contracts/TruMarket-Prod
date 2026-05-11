import * as React from "react"

import { cn } from "src/lib/utils"
import { tmFormControlInputClassName } from "src/lib/form-control-styles"

export type InputProps = React.ComponentProps<"input"> & {
  invalid?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, invalid, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(tmFormControlInputClassName({ invalid }), className)}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export { Input }
