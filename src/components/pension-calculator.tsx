import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Slider } from "./ui/slider"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Calculator, DollarSign, Calendar, TrendingUp, User, Clock, CheckCircle2, XCircle, ExternalLink, AlertCircle, Loader2 } from 'lucide-react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits, Address } from 'viem'
import { PENSION_CONTRACT_ADDRESS, USDC_ADDRESS, PENSION_ABI, USDC_ABI } from '../config/contract'
import { parseContractError, getBaseScanUrl, formatTransactionHash } from '../utils/errorHandling'

interface PensionCalculatorProps {
  language: 'es' | 'en'
}

// Validation constraints
const MIN_MONTHLY_PENSION = 1 // $1 USDC
const MAX_MONTHLY_PENSION = 1000000 // $1M USDC
const MIN_YEARS = 1 // Minimum 1 year
const MAX_YEARS = 10 // Maximum 10 years

type TransactionStep = 'idle' | 'approving' | 'approved' | 'creating' | 'success' | 'error'

export default function PensionCalculator({ language }: PensionCalculatorProps) {
  const [desiredPension, setDesiredPension] = useState<string>("100")
  const [years, setYears] = useState<number[]>([1]) // Duration in years (UI)
  const [validationError, setValidationError] = useState<string>("")
  const [currentStep, setCurrentStep] = useState<TransactionStep>('idle')
  const [errorDetails, setErrorDetails] = useState<{ title: string; message: string; action?: string; actionUrl?: string } | null>(null)
  const [approvalTxHash, setApprovalTxHash] = useState<string>("")
  const [createTxHash, setCreateTxHash] = useState<string>("")

  // Wagmi hooks
  const { address: account, isConnected, chain } = useAccount()

  // Read USDC balance
  const { data: rawBalance, refetch: refetchBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: account ? [account] : undefined,
  })

  // Read current allowance (with polling after approval)
  const { data: currentAllowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: account ? [account, PENSION_CONTRACT_ADDRESS] : undefined,
    query: {
      refetchInterval: currentStep === 'approved' ? 1000 : false, // Poll every 1s after approval
    }
  })

  // Read contract min deposit
  const { data: minDeposit } = useReadContract({
    address: PENSION_CONTRACT_ADDRESS,
    abi: PENSION_ABI,
    functionName: 'minDeposit',
  })

  // Write contracts
  const { writeContract: approveUsdc, data: approveHash, error: approveError, isPending: isApprovePending } = useWriteContract()
  const { writeContract: payPension, data: payPensionHash, error: payPensionError, isPending: isPayPensionPending } = useWriteContract()

  // Wait for approve transaction
  const { isLoading: isApproving, isSuccess: approveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  })

  // Wait for create plan transaction
  const { isLoading: isCreating, isSuccess: createSuccess } = useWaitForTransactionReceipt({
    hash: payPensionHash,
  })

  const usdcBalance = rawBalance ? formatUnits(rawBalance as bigint, 6) : "0"

  const translations = {
    es: {
      title: "Planifica Tu Retiro",
      subtitle: "Calcula tu plan de pensión personalizado",
      desiredPension: "Pensión mensual deseada (USDC)",
      durationYears: "Duración (años)",
      years: "años",
      year: "año",
      totalDeposit: "Depósito total requerido",
      totalReceive: "Total a recibir",
      yourBalance: "Tu balance de USDC:",
      validation: {
        tooLow: `La pensión debe ser al menos $${MIN_MONTHLY_PENSION}`,
        tooHigh: `La pensión no puede exceder $${MAX_MONTHLY_PENSION}`,
        invalidYears: `Duración debe ser entre ${MIN_YEARS} y ${MAX_YEARS} años`,
        insufficientBalance: "Balance insuficiente para este plan",
        belowMinDeposit: "El depósito está por debajo del mínimo requerido",
      },
      steps: {
        idle: "Listo para comenzar",
        approving: "Paso 1/2: Aprobando USDC...",
        approved: "USDC Aprobado ✓",
        creating: "Paso 2/2: Creando plan de pensión...",
        success: "¡Plan creado exitosamente!",
      },
      preflightChecks: "Validaciones previas:",
      balanceCheck: "Balance suficiente",
      approvalCheck: "Aprobación de USDC",
      approveButton: "1. Aprobar USDC",
      createButton: "2. Crear Plan",
      createPlanButton: "Crear Plan de Pensión",
      approved: "Aprobado",
      needsApproval: "Requiere aprobación",
      viewTransaction: "Ver transacción",
      connectFirst: "Conecta tu billetera primero",
      wrongNetwork: "Cambia a Base network",
      calculating: "Calculando...",
    },
    en: {
      title: "Plan Your Retirement",
      subtitle: "Calculate your personalized pension plan",
      desiredPension: "Desired monthly pension (USDC)",
      durationYears: "Duration (years)",
      years: "years",
      year: "year",
      totalDeposit: "Total deposit required",
      totalReceive: "Total to receive",
      yourBalance: "Your USDC balance:",
      validation: {
        tooLow: `Pension must be at least $${MIN_MONTHLY_PENSION}`,
        tooHigh: `Pension cannot exceed $${MAX_MONTHLY_PENSION}`,
        invalidYears: `Duration must be between ${MIN_YEARS} and ${MAX_YEARS} years`,
        insufficientBalance: "Insufficient balance for this plan",
        belowMinDeposit: "Deposit is below minimum required",
      },
      steps: {
        idle: "Ready to start",
        approving: "Step 1/2: Approving USDC...",
        approved: "USDC Approved ✓",
        creating: "Step 2/2: Creating pension plan...",
        success: "Plan created successfully!",
      },
      preflightChecks: "Pre-flight checks:",
      balanceCheck: "Sufficient balance",
      approvalCheck: "USDC Approval",
      approveButton: "1. Approve USDC",
      createButton: "2. Create Plan",
      createPlanButton: "Create Pension Plan",
      approved: "Approved",
      needsApproval: "Needs approval",
      viewTransaction: "View transaction",
      connectFirst: "Connect your wallet first",
      wrongNetwork: "Switch to Base network",
      calculating: "Calculating...",
    }
  }

  const t = translations[language]

  // Calculate total deposit based on contract logic
  const calculateTotalDeposit = (): bigint | null => {
    const monthlyAmount = parseFloat(desiredPension) || 0
    const yearsCount = years[0]
    const monthsCount = yearsCount * 12 // Convert years to months for contract

    if (monthlyAmount <= 0 || yearsCount <= 0) return null

    // Contract formula: totalToReceive = monthlyAmount * months
    // totalAmount = (totalToReceive * 100) / 110 (apply 10% fee)
    // Then truncate to 2 decimals: (totalAmount / 100) * 100
    const totalToReceive = monthlyAmount * monthsCount
    const totalWithFee = (totalToReceive * 100) / 110
    const truncated = Math.floor(totalWithFee / 100) * 100

    return parseUnits(truncated.toString(), 6)
  }

  const totalDeposit = calculateTotalDeposit()
  // Total to receive is deposit * 1.1 (10% fee)
  const totalToReceive = totalDeposit ? (Number(formatUnits(totalDeposit, 6)) * 1.1) : 0

  // Check if approval is needed
  const isApprovalNeeded = totalDeposit && currentAllowance !== undefined
    ? (currentAllowance as bigint) < totalDeposit
    : true
  const isBalanceSufficient = totalDeposit && rawBalance ? (rawBalance as bigint) >= totalDeposit : false
  const canApprove = isConnected && isBalanceSufficient && !validationError && isApprovalNeeded
  const canCreate = isConnected && isBalanceSufficient && !validationError && !isApprovalNeeded

  // Input validation
  useEffect(() => {
    const monthlyAmount = parseFloat(desiredPension) || 0
    const yearsCount = years[0]

    if (monthlyAmount > 0 && monthlyAmount < MIN_MONTHLY_PENSION) {
      setValidationError(t.validation.tooLow)
      return
    }

    if (monthlyAmount > MAX_MONTHLY_PENSION) {
      setValidationError(t.validation.tooHigh)
      return
    }

    if (yearsCount < MIN_YEARS || yearsCount > MAX_YEARS) {
      setValidationError(t.validation.invalidYears)
      return
    }

    if (totalDeposit && rawBalance && totalDeposit > (rawBalance as bigint)) {
      setValidationError(t.validation.insufficientBalance)
      return
    }

    if (totalDeposit && minDeposit && totalDeposit < (minDeposit as bigint)) {
      setValidationError(t.validation.belowMinDeposit)
      return
    }

    setValidationError("")
  }, [desiredPension, years, totalDeposit, rawBalance, minDeposit, t])

  // Handle transaction state changes
  useEffect(() => {
    if (approveHash && !approvalTxHash) {
      setApprovalTxHash(approveHash)
      setCurrentStep('approving')
    }
  }, [approveHash])

  useEffect(() => {
    if (approveSuccess) {
      setCurrentStep('approved')
      refetchAllowance()
    }
  }, [approveSuccess, refetchAllowance])

  // Auto-reset to idle when approval is no longer needed (detected by polling)
  useEffect(() => {
    if (currentStep === 'approved' && !isApprovalNeeded) {
      setCurrentStep('idle')
    }
  }, [currentStep, isApprovalNeeded])

  useEffect(() => {
    if (payPensionHash && !createTxHash) {
      setCreateTxHash(payPensionHash)
      setCurrentStep('creating')
    }
  }, [payPensionHash])

  useEffect(() => {
    if (createSuccess) {
      setCurrentStep('success')
      refetchBalance()
      refetchAllowance()
    }
  }, [createSuccess])

  // Handle errors
  useEffect(() => {
    if (approveError) {
      setCurrentStep('error')
      setErrorDetails(parseContractError(approveError))
    }
  }, [approveError])

  useEffect(() => {
    if (payPensionError) {
      setCurrentStep('error')
      setErrorDetails(parseContractError(payPensionError))
    }
  }, [payPensionError])

  const handleApprove = () => {
    if (!totalDeposit || !account) return

    setErrorDetails(null)
    approveUsdc({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [PENSION_CONTRACT_ADDRESS, totalDeposit],
    })
  }

  const handleCreatePlan = () => {
    if (!totalDeposit || !account) return

    const monthlyAmount = parseUnits(desiredPension, 6)
    const monthsCount = BigInt(years[0] * 12) // Convert years to months for contract

    setErrorDetails(null)
    payPension({
      address: PENSION_CONTRACT_ADDRESS,
      abi: PENSION_ABI,
      functionName: 'payPension',
      args: [monthlyAmount, monthsCount, totalDeposit],
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{t.title}</h1>
          <p className="text-lg text-gray-600">{t.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="border-gray-200 shadow-md">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Calculator className="h-5 w-5 text-gray-700" />
                <span>Parameters</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* USDC Balance with refresh indicator */}
              <div className="p-4 bg-gradient-to-br from-[#27F5A9]/10 to-[#27F5A9]/5 rounded-xl border border-[#27F5A9]/20">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">{t.yourBalance}</div>
                    <div className="text-2xl font-bold text-[#27F5A9]">
                      {usdcBalance} USDC
                    </div>
                  </div>
                  {chain && chain.id !== 8453 && (
                    <Badge variant="destructive" className="ml-2">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {t.wrongNetwork}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Desired Pension Input */}
              <div className="space-y-3">
                <Label htmlFor="pension" className="text-gray-700 font-medium">
                  {t.desiredPension}
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="pension"
                    type="number"
                    min={MIN_MONTHLY_PENSION}
                    max={MAX_MONTHLY_PENSION}
                    value={desiredPension}
                    onChange={(e) => setDesiredPension(e.target.value)}
                    className={`pl-10 border-gray-300 focus:border-[#27F5A9] focus:ring-[#27F5A9] ${
                      validationError ? 'border-red-500' : ''
                    }`}
                    placeholder={`Min: $${MIN_MONTHLY_PENSION}`}
                  />
                </div>
                {validationError && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {validationError}
                  </p>
                )}
              </div>

              {/* Duration Slider */}
              <div className="space-y-4">
                <Label className="text-gray-700 font-medium">{t.durationYears}</Label>
                <div className="px-2">
                  <Slider
                    value={years}
                    onValueChange={(value) => setYears(value)}
                    max={MAX_YEARS}
                    min={MIN_YEARS}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>1 {t.year}</span>
                  <span className="font-semibold text-lg text-gray-900">
                    {years[0]} {years[0] === 1 ? t.year : t.years}
                  </span>
                  <span>{MAX_YEARS} {t.years}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results & Action Section */}
          <Card className="border-gray-200 shadow-md">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <TrendingUp className="h-5 w-5 text-gray-700" />
                <span>Summary & Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Calculation Results */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-gray-100 rounded-xl border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700 font-medium">{t.totalDeposit}</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {totalDeposit ? formatCurrency(parseFloat(formatUnits(totalDeposit, 6))) : formatCurrency(0)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-[#27F5A9]/10 rounded-xl border border-[#27F5A9]/30">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-[#27F5A9]" />
                    <span className="text-sm text-gray-700 font-medium">{t.totalReceive}</span>
                  </div>
                  <span className="font-bold text-[#27F5A9]">
                    {formatCurrency(totalToReceive)}
                  </span>
                </div>
              </div>

              {/* Pre-flight Checks */}
              {isConnected && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="text-sm font-semibold text-blue-900 mb-3">{t.preflightChecks}</div>
                  <div className="space-y-2 text-sm">
                    {/* Balance Check */}
                    <div className="flex items-center justify-between">
                      <span className="text-blue-800">{t.balanceCheck}</span>
                      {isBalanceSufficient ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="text-xs text-blue-700 pl-2">
                      Balance: {formatCurrency(parseFloat(usdcBalance))} USDC
                      {totalDeposit && ` | Required: ${formatCurrency(parseFloat(formatUnits(totalDeposit, 6)))} USDC`}
                    </div>

                    {/* Min Deposit Check */}
                    {minDeposit && totalDeposit && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-blue-800">Min Deposit</span>
                          {totalDeposit >= (minDeposit as bigint) ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div className="text-xs text-blue-700 pl-2">
                          Contract Min: {formatCurrency(parseFloat(formatUnits(minDeposit as bigint, 6)))} USDC
                        </div>
                      </>
                    )}

                    {/* Approval Check */}
                    <div className="flex items-center justify-between">
                      <span className="text-blue-800">{t.approvalCheck}</span>
                      {!isApprovalNeeded ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {t.approved}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          {t.needsApproval}
                        </Badge>
                      )}
                    </div>

                    {/* Debug Info */}
                    {validationError && (
                      <div className="text-xs text-red-600 pl-2 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Error: {validationError}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Transaction Progress */}
              {currentStep !== 'idle' && currentStep !== 'error' && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    {(currentStep === 'approving' || currentStep === 'creating') && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    )}
                    {currentStep === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    <span className="font-semibold text-blue-900">{t.steps[currentStep]}</span>
                  </div>
                  {approvalTxHash && (
                    <a
                      href={getBaseScanUrl(approvalTxHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Approval: {formatTransactionHash(approvalTxHash)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {createTxHash && (
                    <a
                      href={getBaseScanUrl(createTxHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      Plan: {formatTransactionHash(createTxHash)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Error Display */}
              {errorDetails && currentStep === 'error' && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-red-900">{errorDetails.title}</div>
                      <div className="text-sm text-red-800 mt-1">{errorDetails.message}</div>
                      {errorDetails.action && (
                        <div className="text-sm text-red-700 mt-2 font-medium">
                          {errorDetails.actionUrl ? (
                            <a
                              href={errorDetails.actionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline flex items-center gap-1"
                            >
                              {errorDetails.action}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            errorDetails.action
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {!isConnected ? (
                  <Button disabled className="w-full bg-gray-400">
                    <User className="mr-2 h-4 w-4" />
                    {t.connectFirst}
                  </Button>
                ) : isApprovalNeeded ? (
                  <Button
                    onClick={handleApprove}
                    disabled={!canApprove || isApproving || isApprovePending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isApproving || isApprovePending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.steps.approving}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {t.approveButton}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleCreatePlan}
                    disabled={!canCreate || isCreating || isPayPensionPending || currentStep === 'success'}
                    className="w-full bg-[#27F5A9] hover:bg-[#20e094] text-[#1a1a1a]"
                  >
                    {isCreating || isPayPensionPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.steps.creating}
                      </>
                    ) : currentStep === 'success' ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {t.steps.success}
                      </>
                    ) : (
                      <>
                        <User className="mr-2 h-4 w-4" />
                        {t.createPlanButton}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
