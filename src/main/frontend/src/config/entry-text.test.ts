import { describe, expect, it } from "vitest"

import {
  ENTRY_FORM_CONFIRM_DELETE_TEXT,
  ENTRY_FORM_FIELD_LABELS,
  ENTRY_FORM_SAVE_TOASTS,
  ENTRY_FORM_TEXT,
  QUICK_CAPTURE_TEXT,
} from "./entry-text"

describe("entry text config", () => {
  it("exposes the shared entry form labels and action text", () => {
    expect(ENTRY_FORM_FIELD_LABELS.title).toBe("Títol")
    expect(ENTRY_FORM_FIELD_LABELS.tags).toBe("Etiquetes")
    expect(ENTRY_FORM_TEXT.saveAction).toBe("Guardar")
    expect(ENTRY_FORM_TEXT.pinActive).toBe("Fixada")
    expect(ENTRY_FORM_TEXT.pinInactive).toBe("Fixar")
  })

  it("exposes the shared entry form toast and delete confirmation text", () => {
    expect(ENTRY_FORM_SAVE_TOASTS.created).toBe("Creat")
    expect(ENTRY_FORM_SAVE_TOASTS.updated).toBe("Actualitzat")
    expect(ENTRY_FORM_CONFIRM_DELETE_TEXT.description).toBe("Segur que vols esborrar?")
    expect(ENTRY_FORM_CONFIRM_DELETE_TEXT.confirm).toBe("Esborrar")
  })

  it("exposes quick capture placeholders and toast text", () => {
    expect(QUICK_CAPTURE_TEXT.selectPlaceholder).toBe("Tipus")
    expect(QUICK_CAPTURE_TEXT.compactPlaceholder).toBe("Captura ràpida...")
    expect(QUICK_CAPTURE_TEXT.defaultPlaceholder).toBe("Escriu i prem Enter...")
    expect(QUICK_CAPTURE_TEXT.successToast).toBe("Creat")
    expect(QUICK_CAPTURE_TEXT.errorToast).toBe("Error al crear")
  })
})
