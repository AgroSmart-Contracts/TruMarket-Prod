import * as React from "react"

import { cn } from "src/lib/utils"
import { tmFormControlTextareaClassName } from "src/lib/form-control-styles"

export type TextareaProps = React.ComponentProps<"textarea"> & {
  invalid?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      className={cn(tmFormControlTextareaClassName({ invalid }), className)}
      ref={ref}
      {...props}
    />
  ),
)
Textarea.displayName = "Textarea"

export { Textarea }
