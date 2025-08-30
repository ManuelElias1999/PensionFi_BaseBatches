import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Textarea } from "./ui/textarea"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Wallet, Vote, Plus, Clock, CheckCircle, XCircle } from 'lucide-react'

interface GovernancePortalProps {
  language: 'es' | 'en'
}

interface Proposal {
  id: number
  title: string
  description: string
  status: 'active' | 'passed' | 'rejected'
  votesFor: number
  votesAgainst: number
  endDate: string
}

export default function GovernancePortal({ language }: GovernancePortalProps) {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [showNewProposal, setShowNewProposal] = useState(false)
  const [newProposalTitle, setNewProposalTitle] = useState("")
  const [newProposalDescription, setNewProposalDescription] = useState("")

  const translations = {
    es: {
      title: "Portal de Gobernanza",
      subtitle: "Participa en las decisiones del proyecto",
      connectWallet: "Conectar Billetera",
      connected: "Conectado",
      newProposal: "Nueva Propuesta",
      proposals: "Propuestas",
      voteFor: "Votar a Favor",
      voteAgainst: "Votar en Contra",
      status: {
        active: "Activa",
        passed: "Aprobada", 
        rejected: "Rechazada"
      },
      proposalTitle: "Título de la propuesta",
      proposalDescription: "Descripción de la propuesta",
      submit: "Enviar Propuesta",
      cancel: "Cancelar"
    },
    en: {
      title: "Governance Portal",
      subtitle: "Participate in project decisions",
      connectWallet: "Connect Wallet",
      connected: "Connected",
      newProposal: "New Proposal",
      proposals: "Proposals",
      voteFor: "Vote For",
      voteAgainst: "Vote Against",
      status: {
        active: "Active",
        passed: "Passed",
        rejected: "Rejected"
      },
      proposalTitle: "Proposal title",
      proposalDescription: "Proposal description", 
      submit: "Submit Proposal",
      cancel: "Cancel"
    }
  }

  const t = translations[language]

  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: 1,
      title: "Implementar staking de $CAPITAL",
      description: "Propuesta para implementar un sistema de staking que permita a los holders ganar recompensas por mantener sus tokens bloqueados.",
      status: "active",
      votesFor: 1250,
      votesAgainst: 340,
      endDate: "2025-08-15"
    },
    {
      id: 2,
      title: "Reducir fees de transacción",
      description: "Propuesta para reducir las comisiones de transacción del 0.5% al 0.3% para mejorar la adopción.",
      status: "active",
      votesFor: 890,
      votesAgainst: 120,
      endDate: "2025-08-12"
    },
    {
      id: 3,
      title: "Integración con Polygon",
      description: "Expandir el protocolo a la red Polygon para reducir costos de gas.",
      status: "passed",
      votesFor: 2100,
      votesAgainst: 450,
      endDate: "2025-08-01"
    }
  ])

  const handleVote = (proposalId: number, voteType: 'for' | 'against') => {
    if (!isWalletConnected) return
    
    setProposals(prev => prev.map(proposal => 
      proposal.id === proposalId 
        ? {
            ...proposal,
            votesFor: voteType === 'for' ? proposal.votesFor + 1 : proposal.votesFor,
            votesAgainst: voteType === 'against' ? proposal.votesAgainst + 1 : proposal.votesAgainst
          }
        : proposal
    ))
  }

  const handleSubmitProposal = () => {
    if (!newProposalTitle || !newProposalDescription) return

    const newProposal: Proposal = {
      id: proposals.length + 1,
      title: newProposalTitle,
      description: newProposalDescription,
      status: "active",
      votesFor: 0,
      votesAgainst: 0,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }

    setProposals(prev => [newProposal, ...prev])
    setNewProposalTitle("")
    setNewProposalDescription("")
    setShowNewProposal(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'passed': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4" />
      case 'passed': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{t.title}</h1>
            <p className="text-lg text-gray-600">{t.subtitle}</p>
          </div>
          
          <div className="flex space-x-4">
            <Button
              onClick={() => setIsWalletConnected(!isWalletConnected)}
              variant={isWalletConnected ? "outline" : "default"}
              className="flex items-center space-x-2"
            >
              <Wallet className="h-4 w-4" />
              <span>{isWalletConnected ? t.connected : t.connectWallet}</span>
            </Button>
            
            {isWalletConnected && (
              <Button
                onClick={() => setShowNewProposal(!showNewProposal)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>{t.newProposal}</span>
              </Button>
            )}
          </div>
        </div>

        {/* New Proposal Form */}
        {showNewProposal && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t.newProposal}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">{t.proposalTitle}</Label>
                <Input
                  id="title"
                  value={newProposalTitle}
                  onChange={(e) => setNewProposalTitle(e.target.value)}
                  placeholder={t.proposalTitle}
                />
              </div>
              <div>
                <Label htmlFor="description">{t.proposalDescription}</Label>
                <Textarea
                  id="description"
                  value={newProposalDescription}
                  onChange={(e) => setNewProposalDescription(e.target.value)}
                  placeholder={t.proposalDescription}
                  rows={4}
                />
              </div>
              <div className="flex space-x-4">
                <Button onClick={handleSubmitProposal}>{t.submit}</Button>
                <Button variant="outline" onClick={() => setShowNewProposal(false)}>
                  {t.cancel}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Proposals List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">{t.proposals}</h2>
          
          {proposals.map((proposal) => (
            <Card key={proposal.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{proposal.title}</CardTitle>
                    <p className="text-gray-600">{proposal.description}</p>
                  </div>
                  <Badge className={`ml-4 ${getStatusColor(proposal.status)}`}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(proposal.status)}
                      <span>{t.status[proposal.status as keyof typeof t.status]}</span>
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{proposal.votesFor}</div>
                      <div className="text-sm text-gray-500">A favor</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{proposal.votesAgainst}</div>
                      <div className="text-sm text-gray-500">En contra</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Termina: {proposal.endDate}</div>
                    </div>
                  </div>
                  
                  {proposal.status === 'active' && isWalletConnected && (
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleVote(proposal.id, 'for')}
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <Vote className="h-4 w-4 mr-2" />
                        {t.voteFor}
                      </Button>
                      <Button
                        onClick={() => handleVote(proposal.id, 'against')}
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Vote className="h-4 w-4 mr-2" />
                        {t.voteAgainst}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
