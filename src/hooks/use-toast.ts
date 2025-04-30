"use client"

import { toast as sonnerToast } from "sonner"
import type { ToasterProps } from "sonner"

export interface Toast extends ToasterProps {
  title?: string
  description?: string
}

function useToast() {
  return {
    toast: (props: Toast) => {
      if (props.title || props.description) {
        return sonnerToast(props.title || '', {
          description: props.description,
          ...props
        })
      }
      return sonnerToast('', { ...props })
    },
    dismiss: sonnerToast.dismiss,
    message: sonnerToast,
    error: sonnerToast.error,
    success: sonnerToast.success,
    warning: sonnerToast.warning,
    info: sonnerToast.info,
  }
}

export { useToast }
