"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  FileCheck2,
  Upload,
  X,
} from "lucide-react"
import { useApplication } from "@/lib/application-context"
import { Button } from "@/components/ui/button"
import type { RequestedDocumentUpload } from "@/lib/salesforce/types"

const REQUIRED_DOCUMENTS = [
  {
    name: "Driver License",
    title: "Upload Driver License",
    description: "Upload a photo, scan, or PDF copy of your driver license.",
    removeLabel: "Remove uploaded driver license",
  },
  {
    name: "Income Tax Related Document",
    title: "Upload Income Tax Related Document",
    description: "Upload your income tax related document as a PDF or image.",
    removeLabel: "Remove uploaded income tax related document",
  },
] as const

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function readFileAsUpload(
  file: File,
  documentName: string
): Promise<RequestedDocumentUpload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : ""
      const base64 = result.includes(",") ? result.split(",")[1] : result

      resolve({
        documentName,
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        size: file.size,
        base64,
      })
    }
    reader.onerror = () => reject(new Error("Unable to read the selected file."))
    reader.readAsDataURL(file)
  })
}

export default function RequestedItemsPage() {
  const router = useRouter()
  const {
    requestedDocumentUploads,
    selectedProduct,
    setCurrentStep,
    setRequestedDocumentUpload,
  } = useApplication()
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [draggingDocument, setDraggingDocument] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setCurrentStep("requestedItems")
  }, [setCurrentStep])

  const getUpload = (documentName: string) =>
    requestedDocumentUploads.find(
      (upload) => upload.documentName === documentName
    ) ?? null

  const hasAllRequiredDocuments = REQUIRED_DOCUMENTS.every((document) =>
    getUpload(document.name)
  )

  const handleFile = async (documentName: string, file: File | undefined) => {
    if (!file) return

    setError(null)

    try {
      const upload = await readFileAsUpload(file, documentName)
      setRequestedDocumentUpload(upload)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to prepare this file for upload."
      )
    }
  }

  const clearFile = (documentName: string) => {
    const currentUploads = requestedDocumentUploads.filter(
      (upload) => upload.documentName !== documentName
    )
    setRequestedDocumentUpload(null)
    currentUploads.forEach((upload) => setRequestedDocumentUpload(upload))
    setError(null)
    if (inputRefs.current[documentName]) {
      inputRefs.current[documentName]!.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Requested Items</h1>
        <p className="mt-1 text-muted-foreground">
          Upload your driver license and income tax related document for your{" "}
          <span className="font-medium text-foreground">
            {selectedProduct?.name ?? "selected"}
          </span>{" "}
          account.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {REQUIRED_DOCUMENTS.map((document) => {
          const upload = getUpload(document.name)
          const isDragging = draggingDocument === document.name

          return (
            <div
              key={document.name}
              onDragEnter={(event) => {
                event.preventDefault()
                setDraggingDocument(document.name)
              }}
              onDragOver={(event) => {
                event.preventDefault()
                setDraggingDocument(document.name)
              }}
              onDragLeave={(event) => {
                event.preventDefault()
                setDraggingDocument(null)
              }}
              onDrop={(event) => {
                event.preventDefault()
                setDraggingDocument(null)
                void handleFile(document.name, event.dataTransfer.files[0])
              }}
              className={`rounded-lg border border-dashed bg-card p-6 transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <input
                ref={(node) => {
                  inputRefs.current[document.name] = node
                }}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(event) =>
                  void handleFile(document.name, event.target.files?.[0])
                }
              />

              {upload ? (
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-success/10">
                    <FileCheck2 className="h-5 w-5 text-success" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {document.name}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {upload.fileName} - {formatFileSize(upload.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => clearFile(document.name)}
                    aria-label={document.removeLabel}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {document.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {document.description}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => inputRefs.current[document.name]?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Choose File
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => router.push("/apply/disclosures")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          size="lg"
          disabled={!hasAllRequiredDocuments}
          onClick={() => router.push("/apply/funding")}
          className="gap-2"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
