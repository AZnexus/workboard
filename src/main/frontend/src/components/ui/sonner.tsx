import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      richColors
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast shadow-lg p-4 text-base border",
          description: "group-[.toast]:text-secondary text-sm",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <OctagonXIcon className="size-5" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--surface-2)",
          "--normal-text": "var(--text-primary)",
          "--normal-border": "var(--border-subtle)",
          "--border-radius": "var(--radius-lg)",
          "--success-bg": "color-mix(in srgb, var(--surface-1) 92%, var(--data-positive))",
          "--success-text": "var(--data-positive)",
          "--success-border": "var(--data-positive)",
          "--error-bg": "color-mix(in srgb, var(--surface-1) 92%, var(--data-negative))",
          "--error-text": "var(--data-negative)",
          "--error-border": "var(--data-negative)",
          "--warning-bg": "color-mix(in srgb, var(--surface-1) 92%, var(--data-warning))",
          "--warning-text": "var(--data-warning)",
          "--warning-border": "var(--data-warning)",
          "--info-bg": "color-mix(in srgb, var(--surface-1) 92%, var(--data-info))",
          "--info-text": "var(--data-info)",
          "--info-border": "var(--data-info)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
