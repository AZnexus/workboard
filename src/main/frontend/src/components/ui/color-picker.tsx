import { Check } from "lucide-react"

interface ColorPickerProps {
  palette: string[]
  value: string
  onChange: (color: string) => void
}

const VISIBLE_SWATCHES = 8

export function ColorPicker({ palette, value, onChange }: ColorPickerProps) {
  const visiblePalette = palette.slice(0, VISIBLE_SWATCHES)
  const isCustomColor = !visiblePalette.includes(value)

  return (
    <div className="flex items-center gap-2 p-1.5 bg-muted/20 rounded-lg border border-border/50">
      {visiblePalette.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
            value === color
              ? "scale-110 z-10"
              : "hover:scale-110 opacity-90 hover:opacity-100"
          }`}
          style={{
            backgroundColor: color,
            boxShadow: value === color ? `0 0 0 2px hsl(var(--background)), 0 0 0 4px ${color}` : "none",
          }}
        >
          {value === color && <Check className="w-4 h-4 text-white drop-shadow-md" strokeWidth={3} />}
        </button>
      ))}

      <div className="w-px h-6 bg-border mx-1" />

      <div
        className={`relative w-7 h-7 rounded-full overflow-hidden transition-all duration-200 hover:scale-110 ${
          isCustomColor ? "scale-110 z-10" : ""
        }`}
        style={{
          backgroundColor: value,
          boxShadow: isCustomColor ? `0 0 0 2px hsl(var(--background)), 0 0 0 4px ${value}` : "none",
        }}
      >
        {isCustomColor && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Check className="w-4 h-4 text-white drop-shadow-md" strokeWidth={3} />
          </div>
        )}
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer opacity-0"
          title="Color personalitzat"
        />
      </div>
    </div>
  )
}
