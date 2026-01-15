import { ArrowRight, CheckCircle, Clock, User, Smartphone, Calendar, Bell } from 'lucide-react';

export function ProcessFlowDiagram() {
  const steps = [
    {
      phase: 'Fase 1: Descoberta do Cliente',
      color: 'bg-purple-100 border-purple-300',
      steps: [
        { icon: User, label: 'Giovana acessa Landing Page', actor: 'Cliente' },
        { icon: Calendar, label: 'Visualiza Serviços & Galeria', actor: 'Cliente' },
        { icon: ArrowRight, label: 'Clica em "Agendar Agora"', actor: 'Cliente' },
      ],
    },
    {
      phase: 'Fase 2: Processo de Agendamento',
      color: 'bg-pink-100 border-pink-300',
      steps: [
        { icon: CheckCircle, label: 'Seleciona Serviço', actor: 'Sistema' },
        { icon: Clock, label: 'Verifica Disponibilidade do Calendário', actor: 'Sistema' },
        { icon: Calendar, label: 'Escolhe Data & Hora', actor: 'Cliente' },
        { icon: User, label: 'Login/Registro', actor: 'Cliente' },
        { icon: CheckCircle, label: 'Confirma Agendamento', actor: 'Cliente' },
      ],
    },
    {
      phase: 'Fase 3: Automação',
      color: 'bg-green-100 border-green-300',
      steps: [
        { icon: CheckCircle, label: 'Cria Agendamento (Status: Pendente)', actor: 'Sistema' },
        { icon: Smartphone, label: 'Envia WhatsApp para Giovana', actor: 'Chatbot' },
        { icon: Bell, label: 'Notifica Annika', actor: 'Chatbot' },
        { icon: Calendar, label: 'Bloqueia Slot de Tempo', actor: 'Sistema' },
      ],
    },
    {
      phase: 'Fase 4: Gerenciamento',
      color: 'bg-blue-100 border-blue-300',
      steps: [
        { icon: User, label: 'Annika faz login no Admin', actor: 'Profissional' },
        { icon: Calendar, label: 'Visualiza Agendamento no Painel', actor: 'Profissional' },
        { icon: CheckCircle, label: 'Agendamento Pronto', actor: 'Sistema' },
      ],
    },
  ];

  return (
    <div className="pb-24 px-5 pt-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-primary">Fluxo de Processos Empresariais</h2>
        <p className="text-gray-600 text-sm">Jornada completa de agendamento (BPMN)</p>
      </div>

      {/* Process Phases */}
      <div className="space-y-6">
        {steps.map((phase, phaseIndex) => (
          <div key={phaseIndex} className="bg-white rounded-xl p-5 shadow-md">
            <h3 className="text-gray-800 mb-4">{phase.phase}</h3>

            <div className="space-y-3">
              {phase.steps.map((step, stepIndex) => {
                const Icon = step.icon;
                return (
                  <div key={stepIndex}>
                    <div className={`${phase.color} border-2 rounded-lg p-4`}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Icon className="text-primary" size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800">{step.label}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            Actor: <span className="text-accent">{step.actor}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Arrow between steps */}
                    {stepIndex < phase.steps.length - 1 && (
                      <div className="flex justify-center py-2">
                        <div className="w-px h-6 bg-gray-300"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Arrow between phases */}
            {phaseIndex < steps.length - 1 && (
              <div className="flex justify-center py-4">
                <ArrowRight className="text-accent" size={32} strokeWidth={3} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Key Actors Legend */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 shadow-md mt-6">
        <h4 className="text-primary mb-3">Atores Principais</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent rounded-full"></div>
            <span className="text-gray-700">
              <strong>Cliente (Giovana):</strong> Usuário final agendando serviços
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-gray-700">
              <strong>Sistema:</strong> Lógica de negócio automatizada
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span className="text-gray-700">
              <strong>Chatbot:</strong> Automação WhatsApp
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-gray-700">
              <strong>Profissional (Annika):</strong> Prestadora de serviços & admin
            </span>
          </div>
        </div>
      </div>

      {/* Integration Notes */}
      <div className="bg-white rounded-xl p-5 shadow-md mt-4">
        <h4 className="text-gray-800 mb-3">Pontos de Integração</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-accent mt-1">•</span>
            <span>
              <strong>WhatsApp API:</strong> Mensagens automatizadas para confirmações e lembretes
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-1">•</span>
            <span>
              <strong>Sincronização de Calendário:</strong> Integração Google Calendar para conveniência do cliente
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-1">•</span>
            <span>
              <strong>Rastreamento Financeiro:</strong> Geração automática de recebíveis no agendamento
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-1">•</span>
            <span>
              <strong>Gerenciamento de Status:</strong> Atualizações em tempo real (Pendente → Confirmado → Concluído)
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
