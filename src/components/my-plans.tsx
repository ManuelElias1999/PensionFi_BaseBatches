import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Clock, DollarSign, CheckCircle, AlertCircle, Wallet, Info, ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { formatUnits, Address } from 'viem'
import { PENSION_CONTRACT_ADDRESS, PENSION_ABI } from '../config/contract'
import { getBaseScanUrl } from '../utils/errorHandling'

interface Plan {
  id: bigint
  beneficiary: Address
  paymentAmount: bigint
  paymentsRemaining: bigint
  lastPaid: bigint
  active: boolean
}

interface MyPlansProps {
  language: 'es' | 'en'
  account: string | null
}

export default function MyPlans({ language }: MyPlansProps) {
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<{ [key: string]: Plan }>({})

  const { address: account, isConnected } = useAccount()

  const translations = {
    es: {
      title: "Mis Planes de Pensión",
      noPlans: "No tienes planes de pensión activos.",
      planId: "ID del Plan",
      beneficiary: "Beneficiario",
      monthlyPayment: "Pago Mensual",
      paymentsRemaining: "Pagos Restantes",
      totalPaid: "Total Pagado",
      lastPayment: "Último Pago",
      nextPayment: "Próximo Pago",
      active: "Activo",
      inactive: "Completado",
      loadingPlans: "Cargando planes...",
      connectWallet: "Conecta tu billetera para ver tus planes",
      viewOnBaseScan: "Ver en BaseScan",
      refreshPlans: "Actualizar",
      contractInfo: "Información del Contrato",
      contractDescription: "Los pagos son procesados automáticamente por Chainlink Automation cada mes.",
      howItWorks: "Cómo funciona",
      step1Title: "1. Plan Creado",
      step1Desc: "Depositaste el total y el contrato guarda tus fondos de forma segura.",
      step2Title: "2. Pagos Automáticos",
      step2Desc: "Chainlink Automation procesa pagos mensuales automáticamente.",
      step3Title: "3. Recibe tus Fondos",
      step3Desc: "Los pagos se envían a tu wallet cada mes sin intervención manual.",
      step4Title: "4. Plan Completa",
      step4Desc: "Cuando todos los pagos se completen, el plan se marca como inactivo.",
      interval: "Intervalo de Pagos",
      days: "días",
      planCompleted: "Este plan se ha completado. Todos los pagos fueron recibidos.",
    },
    en: {
      title: "My Pension Plans",
      noPlans: "You don't have any active pension plans.",
      planId: "Plan ID",
      beneficiary: "Beneficiary",
      monthlyPayment: "Monthly Payment",
      paymentsRemaining: "Payments Remaining",
      totalPaid: "Total Paid",
      lastPayment: "Last Payment",
      nextPayment: "Next Payment",
      active: "Active",
      inactive: "Completed",
      loadingPlans: "Loading plans...",
      connectWallet: "Connect your wallet to view your plans",
      viewOnBaseScan: "View on BaseScan",
      refreshPlans: "Refresh",
      contractInfo: "Contract Information",
      contractDescription: "Payments are automatically processed by Chainlink Automation every month.",
      howItWorks: "How it works",
      step1Title: "1. Plan Created",
      step1Desc: "You deposited the total and the contract keeps your funds securely.",
      step2Title: "2. Automatic Payments",
      step2Desc: "Chainlink Automation processes monthly payments automatically.",
      step3Title: "3. Receive Your Funds",
      step3Desc: "Payments are sent to your wallet each month without manual intervention.",
      step4Title: "4. Plan Completes",
      step4Desc: "When all payments are completed, the plan is marked as inactive.",
      interval: "Payment Interval",
      days: "days",
      planCompleted: "This plan has been completed. All payments have been received.",
    }
  }

  const t = translations[language]

  // Read all plan IDs
  const { data: allPlanIds, isLoading: isLoadingIds, refetch: refetchIds } = useReadContract({
    address: PENSION_CONTRACT_ADDRESS,
    abi: PENSION_ABI,
    functionName: 'getPlanIds',
  })

  // Read interval
  const { data: intervalData } = useReadContract({
    address: PENSION_CONTRACT_ADDRESS,
    abi: PENSION_ABI,
    functionName: 'interval',
  })

  const interval = intervalData ? Number(intervalData as bigint) : 0
  const intervalDays = Math.floor(interval / 86400) // Convert seconds to days

  // Filter plan IDs to get only user's plans
  const userPlanIds = allPlanIds && account
    ? (allPlanIds as bigint[]).filter((id) => id > 0n)
    : []

  // Prepare contracts to read multiple plans at once
  const planContracts = userPlanIds.map((planId) => ({
    address: PENSION_CONTRACT_ADDRESS,
    abi: PENSION_ABI,
    functionName: 'getPlan' as const,
    args: [planId],
  }))

  const { data: plansData, isLoading: isLoadingPlans, refetch: refetchPlans } = useReadContracts({
    contracts: planContracts,
  })

  // Parse and filter user's plans
  const userPlans: { id: bigint; plan: Plan }[] = []

  if (plansData && account) {
    plansData.forEach((result, index) => {
      if (result.status === 'success' && result.result) {
        const [beneficiary, paymentAmount, paymentsRemaining, lastPaid, active] = result.result as [Address, bigint, bigint, bigint, boolean]

        // Only include plans where user is the beneficiary
        if (beneficiary.toLowerCase() === account.toLowerCase()) {
          userPlans.push({
            id: userPlanIds[index],
            plan: {
              id: userPlanIds[index],
              beneficiary,
              paymentAmount,
              paymentsRemaining,
              lastPaid,
              active,
            },
          })
        }
      }
    })
  }

  const isLoading = isLoadingIds || isLoadingPlans

  // Format currency
  const formatCurrency = (amount: bigint) => {
    return formatUnits(amount, 6) // USDC has 6 decimals
  }

  // Format date
  const formatDate = (timestamp: bigint) => {
    if (timestamp === 0n) return 'N/A'
    const date = new Date(Number(timestamp) * 1000)
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Calculate next payment date
  const getNextPaymentDate = (lastPaid: bigint) => {
    if (lastPaid === 0n) return 'N/A'
    const nextPaymentTimestamp = Number(lastPaid) + interval
    const date = new Date(nextPaymentTimestamp * 1000)
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Calculate total paid
  const calculateTotalPaid = (paymentAmount: bigint, paymentsRemaining: bigint, totalPayments: bigint) => {
    const paidPayments = totalPayments - paymentsRemaining
    return paymentAmount * paidPayments
  }

  const handleRefresh = () => {
    refetchIds()
    refetchPlans()
  }

  return (
    <div className="flex-1 p-4 md:p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
            {account && (
              <p className="text-sm text-gray-600">
                {account.substring(0, 6)}...{account.substring(38)}
              </p>
            )}
          </div>
          {isConnected && (
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="mt-4 md:mt-0"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t.refreshPlans}
            </Button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 text-[#27F5A9] mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">{t.loadingPlans}</p>
          </div>
        )}

        {/* Not Connected State */}
        {!isConnected && !isLoading && (
          <Card className="text-center py-12">
            <CardContent>
              <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.connectWallet}</h3>
            </CardContent>
          </Card>
        )}

        {/* No Plans State */}
        {isConnected && !isLoading && userPlans.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noPlans}</h3>
            </CardContent>
          </Card>
        )}

        {/* Plans List */}
        {isConnected && !isLoading && userPlans.length > 0 && (
          <div className="space-y-6">
            {/* Contract Info Card */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900">
                  <Info className="h-5 w-5 mr-2" />
                  {t.contractInfo}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-blue-800">{t.contractDescription}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-blue-900">{t.interval}:</span>
                  <Badge variant="secondary">{intervalDays} {t.days}</Badge>
                </div>
                <a
                  href={`https://basescan.org/address/${PENSION_CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  {t.viewOnBaseScan}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </CardContent>
            </Card>

            {/* Plans */}
            {userPlans.map(({ id, plan }) => {
              // Estimate total payments (we don't have this from contract, so we estimate)
              const estimatedTotalPayments = plan.paymentsRemaining + 1n // At least 1 payment
              const totalPaid = calculateTotalPaid(plan.paymentAmount, plan.paymentsRemaining, estimatedTotalPayments)

              return (
                <Card key={id.toString()} className="border-gray-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
                    <CardTitle className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                      <span className="text-xl">Plan #{id.toString()}</span>
                      <Badge
                        variant={plan.active ? "default" : "secondary"}
                        className={plan.active ? "bg-green-600" : "bg-gray-400"}
                      >
                        {plan.active ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {t.active}
                          </>
                        ) : (
                          t.inactive
                        )}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    {/* Plan Completed Message */}
                    {!plan.active && plan.paymentsRemaining === 0n && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-green-800">{t.planCompleted}</p>
                        </div>
                      </div>
                    )}

                    {/* Payment Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-[#27F5A9]/10 p-4 rounded-xl border border-[#27F5A9]/30">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="h-4 w-4 text-[#27F5A9]" />
                          <p className="text-sm text-gray-600">{t.monthlyPayment}</p>
                        </div>
                        <p className="text-2xl font-bold text-[#27F5A9]">
                          ${formatCurrency(plan.paymentAmount)}
                        </p>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <p className="text-sm text-gray-600">{t.paymentsRemaining}</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-900">
                          {plan.paymentsRemaining.toString()}
                        </p>
                      </div>

                      <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <p className="text-sm text-gray-600">{t.totalPaid}</p>
                        </div>
                        <p className="text-2xl font-bold text-green-900">
                          ${formatCurrency(totalPaid)}
                        </p>
                      </div>
                    </div>

                    {/* Payment Timeline */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">{t.lastPayment}</p>
                        <p className="font-semibold text-gray-900">{formatDate(plan.lastPaid)}</p>
                      </div>

                      {plan.active && plan.paymentsRemaining > 0n && (
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <p className="text-sm text-gray-600 mb-1">{t.nextPayment}</p>
                          <p className="font-semibold text-orange-900">{getNextPaymentDate(plan.lastPaid)}</p>
                        </div>
                      )}
                    </div>

                    {/* Beneficiary Info */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">{t.beneficiary}</p>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                          {plan.beneficiary}
                        </code>
                        <a
                          href={`https://basescan.org/address/${plan.beneficiary}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {/* How it Works */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <Info className="h-5 w-5 mr-2 text-blue-600" />
                  {t.howItWorks}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: t.step1Title, desc: t.step1Desc },
                  { title: t.step2Title, desc: t.step2Desc },
                  { title: t.step3Title, desc: t.step3Desc },
                  { title: t.step4Title, desc: t.step4Desc },
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#27F5A9] flex items-center justify-center">
                      <span className="text-[#1a1a1a] text-sm font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
