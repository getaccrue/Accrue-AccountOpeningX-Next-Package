"use client"

import { useApplication, STEPS } from "@/lib/application-context"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function Stepper() {
  const { currentStep, getStepIndex } = useApplication()
  const currentIndex = getStepIndex(currentStep)

  // Show only the main steps (exclude "complete")
  const visibleSteps = STEPS.filter((s) => s.key !== "complete")

  return (
    <nav aria-label="Application progress" className="w-full">
      {/* Desktop stepper */}
      <ol className="hidden items-center md:flex">
        {visibleSteps.map((step, index) => {
          const stepIndex = getStepIndex(step.key)
          const isComplete = stepIndex < currentIndex
          const isCurrent = step.key === currentStep
          const isFuture = stepIndex > currentIndex

          return (
            <li
              key={step.key}
              className={cn(
                "flex items-center",
                index < visibleSteps.length - 1 && "flex-1"
              )}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-medium transition-all",
                    isComplete &&
                      "border-primary bg-primary text-primary-foreground",
                    isCurrent &&
                      "border-primary bg-primary/10 text-primary",
                    isFuture &&
                      "border-muted-foreground/30 text-muted-foreground/50"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "whitespace-nowrap text-xs font-medium",
                    isComplete && "text-primary",
                    isCurrent && "text-primary",
                    isFuture && "text-muted-foreground/50"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < visibleSteps.length - 1 && (
                <div
                  className={cn(
                    "mx-2 mt-[-1.25rem] h-0.5 flex-1",
                    stepIndex < currentIndex
                      ? "bg-primary"
                      : "bg-muted-foreground/20"
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>

      {/* Mobile stepper */}
      <div className="flex items-center gap-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {Math.min(currentIndex + 1, visibleSteps.length)}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {visibleSteps[Math.min(currentIndex, visibleSteps.length - 1)]
                ?.label || "Complete"}
            </p>
            <p className="text-xs text-muted-foreground">
              {"Step "}
              {Math.min(currentIndex + 1, visibleSteps.length)}
              {" of "}
              {visibleSteps.length}
            </p>
          </div>
        </div>
        <div className="ml-auto flex gap-1">
          {visibleSteps.map((step, index) => (
            <div
              key={step.key}
              className={cn(
                "h-1.5 w-6 rounded-full",
                index <= currentIndex
                  ? "bg-primary"
                  : "bg-muted-foreground/20"
              )}
            />
          ))}
        </div>
      </div>
    </nav>
  )
}
