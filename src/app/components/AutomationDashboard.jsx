import { MessageCircle, Bell, CheckCircle, Clock, Send } from 'lucide-react';

export function AutomationDashboard() {
  const automationRules = [
    {
      id: '1',
      name: 'New Booking Confirmation',
      trigger: 'When appointment is created',
      action: 'Send WhatsApp to client',
      status: 'active',
      lastTriggered: '2 hours ago',
      sentCount: 12,
    },
    {
      id: '2',
      name: '24h Reminder',
      trigger: '24 hours before appointment',
      action: 'Send reminder via WhatsApp',
      status: 'active',
      lastTriggered: '1 hour ago',
      sentCount: 8,
    },
    {
      id: '3',
      name: 'Admin Notification',
      trigger: 'New booking request',
      action: 'Notify Annika via WhatsApp',
      status: 'active',
      lastTriggered: '2 hours ago',
      sentCount: 12,
    },
    {
      id: '4',
      name: 'Payment Reminder',
      trigger: 'Payment overdue by 3 days',
      action: 'Send payment reminder',
      status: 'active',
      lastTriggered: 'Yesterday',
      sentCount: 2,
    },
  ];

  const recentMessages = [
    {
      id: '1',
      recipient: 'Maria Silva',
      type: 'confirmation',
      message: 'Your appointment is confirmed for Dec 19 at 10:00',
      status: 'delivered',
      timestamp: '2 hours ago',
    },
    {
      id: '2',
      recipient: 'Annika',
      type: 'notification',
      message: 'New booking: Maria Silva - Gel Nails - Dec 19, 10:00',
      status: 'delivered',
      timestamp: '2 hours ago',
    },
    {
      id: '3',
      recipient: 'Ana Costa',
      type: 'reminder',
      message: 'Reminder: Your appointment is tomorrow at 14:00',
      status: 'delivered',
      timestamp: '1 hour ago',
    },
    {
      id: '4',
      recipient: 'Julia Santos',
      type: 'confirmation',
      message: 'Your appointment is confirmed for Dec 20 at 16:00',
      status: 'read',
      timestamp: '3 hours ago',
    },
  ];

  return (
    <div className="pb-24 px-5 pt-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-primary">Painel de Automação</h2>
        <p className="text-gray-600 text-sm">Automação de comunicação via WhatsApp</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl p-3 shadow-md text-center">
          <div className="flex justify-center mb-2">
            <Send className="text-primary" size={24} />
          </div>
          <p className="text-2xl text-primary">34</p>
          <p className="text-gray-600 text-xs mt-1">Enviadas Hoje</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-md text-center">
          <div className="flex justify-center mb-2">
            <CheckCircle className="text-green-600" size={24} />
          </div>
          <p className="text-2xl text-green-600">32</p>
          <p className="text-gray-600 text-xs mt-1">Entregues</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-md text-center">
          <div className="flex justify-center mb-2">
            <Bell className="text-accent" size={24} />
          </div>
          <p className="text-2xl text-accent">4</p>
          <p className="text-gray-600 text-xs mt-1">Regras Ativas</p>
        </div>
      </div>

      {/* Automation Rules */}
      <div className="mb-6">
        <h3 className="text-gray-800 mb-3">Regras de Automação</h3>
        <div className="space-y-3">
          {automationRules.map((rule) => (
            <div key={rule.id} className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle className="text-primary flex-shrink-0" size={18} />
                    <h4 className="text-primary">{rule.name}</h4>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">
                    <span className="text-gray-500">Gatilho:</span> {rule.trigger}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <span className="text-gray-500">Ação:</span> {rule.action}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs flex-shrink-0 ${
                    rule.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {rule.status}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <Clock size={12} />
                  <span>Last: {rule.lastTriggered}</span>
                </div>
                <div className="text-accent text-xs">
                  {rule.sentCount} messages sent
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Messages */}
      <div className="mb-6">
        <h3 className="text-gray-800 mb-3">Recent Messages</h3>
        <div className="space-y-3">
          {recentMessages.map((msg) => (
            <div key={msg.id} className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="text-accent" size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 truncate">{msg.recipient}</p>
                      <p className="text-gray-500 text-xs capitalize">{msg.type}</p>
                    </div>
                  </div>
                </div>
                <span className="text-gray-400 text-xs flex-shrink-0">{msg.timestamp}</span>
              </div>

              <div className="bg-green-50 rounded-lg p-3 mb-2">
                <p className="text-gray-700 text-sm">{msg.message}</p>
              </div>

              <div className="flex items-center gap-1">
                {msg.status === 'delivered' && (
                  <>
                    <CheckCircle className="text-green-600" size={14} />
                    <span className="text-green-600 text-xs">Delivered</span>
                  </>
                )}
                {msg.status === 'read' && (
                  <>
                    <CheckCircle className="text-blue-600" size={14} />
                    <CheckCircle className="text-blue-600 -ml-2" size={14} />
                    <span className="text-blue-600 text-xs">Read</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Template Manager */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 shadow-md">
        <h4 className="text-primary mb-2">Message Templates</h4>
        <p className="text-gray-600 text-sm mb-4">
          Customize your automated WhatsApp messages
        </p>
        <button className="w-full bg-primary text-white py-3 rounded-xl hover:shadow-lg transition-shadow">
          Manage Templates
        </button>
      </div>
    </div>
  );
}
