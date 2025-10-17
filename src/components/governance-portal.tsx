interface GovernancePortalProps {
  language: 'es' | 'en'
}

interface Proposal {
  id: number
  title: string
  description: string
  votesFor: number
  votesAgainst: number
  deadline: string
  status: 'active' | 'passed' | 'rejected' | 'pending'
}

export default function GovernancePortal({ language }: GovernancePortalProps) {
  const translations = {
    es: {
      title: "Portal de Gobernanza",
      subtitle: "Participa en las decisiones del proyecto",
      proposals: "Propuestas",
      votesFor: "A favor",
      votesAgainst: "En contra",
      deadline: "Termina:",
      active: "Activo",
      passed: "Aprobado",
      rejected: "Rechazado",
      pending: "Pendiente"
    },
    en: {
      title: "Governance Portal",
      subtitle: "Participate in project decisions",
      proposals: "Proposals",
      votesFor: "For",
      votesAgainst: "Against",
      deadline: "Deadline:",
      active: "Active",
      passed: "Passed",
      rejected: "Rejected",
      pending: "Pending"
    }
  }

  const t = translations[language]

  const proposals: Proposal[] = [
    {
      id: 1,
      title: "Implementar staking de $CAPITAL",
      description: "Propuesta para implementar un sistema de staking que permita a los holders ganar recompensas por mantener sus tokens bloqueados.",
      votesFor: 1250,
      votesAgainst: 340,
      deadline: "2025-09-15",
      status: "active"
    },
    {
      id: 2,
      title: "Reducir fees de transacción",
      description: "Propuesta para reducir las comisiones de transacción del 0.5% al 0.3% para mejorar la adopción.",
      votesFor: 890,
      votesAgainst: 120,
      deadline: "2025-09-12",
      status: "active"
    },
    {
      id: 3,
      title: "Integración con Polygon",
      description: "Expandir el protocolo a la red Polygon para reducir costos de gas.",
      votesFor: 2100,
      votesAgainst: 450,
      deadline: "2025-08-01",
      status: "pending"
    }
  ]

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-gray-900 text-white',
      passed: 'bg-green-500 text-white',
      rejected: 'bg-red-500 text-white',
      pending: 'bg-gray-300 text-gray-700'
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
        {t[status as keyof typeof t]}
      </span>
    )
  }

  return (
    <div className="flex-1 bg-white p-8 overflow-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        {/* Proposals Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t.proposals}</h2>
          
          <div className="space-y-4">
            {proposals.map((proposal) => (
              <div 
                key={proposal.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">
                    {proposal.title}
                  </h3>
                  {getStatusBadge(proposal.status)}
                </div>
                
                <p className="text-gray-600 text-sm mb-4">
                  {proposal.description}
                </p>

                <div className="flex items-center gap-8 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">
                      {proposal.votesFor}
                    </span>
                    <span className="text-gray-600">{t.votesFor}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-red-600">
                      {proposal.votesAgainst}
                    </span>
                    <span className="text-gray-600">{t.votesAgainst}</span>
                  </div>

                  <div className="ml-auto text-gray-500 text-sm">
                    {t.deadline} {proposal.deadline}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
