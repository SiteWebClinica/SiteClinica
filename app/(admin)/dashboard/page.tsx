"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin
} from "lucide-react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from "date-fns";
import { ptBR } from "date-fns/locale";
import clsx from "clsx";

// --- MOCK DE DADOS ---
const MOCK_EVENTS = [
  {
    id: 1,
    date: new Date(), // Hoje
    title: "Roberto Silva",
    type: "consultation", 
    time: "14:30",
  },
  {
    id: 2,
    date: new Date(), // Hoje
    title: "Ana Julia",
    type: "exam",
    time: "16:00",
  },
  {
    id: 3,
    date: new Date(new Date().setDate(new Date().getDate() + 2)), // Daqui a 2 dias
    title: "Carlos Edu",
    type: "consultation",
    time: "09:00",
  },
  {
    id: 4,
    date: new Date(new Date().setDate(new Date().getDate() + 5)), // Daqui a 5 dias
    title: "Mariana Souza",
    type: "exam",
    time: "11:15",
  }
];

// --- COMPONENTES AUXILIARES ---

function QuickActionButton({ icon: Icon, label, colorClass }: any) {
  return (
    <button
      className={`${colorClass} text-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-3 font-medium`}
    >
      <Icon size={24} />
      <span>{label}</span>
    </button>
  );
}

function FinancialCard({ title, value, subtitle, icon: Icon, theme }: any) {
  const themes: any = {
    success: { bg: "bg-green-600", text: "text-white", iconBg: "bg-green-500/30" },
    danger: { bg: "bg-red-600", text: "text-white", iconBg: "bg-red-500/30" },
    warning: { bg: "bg-yellow-500", text: "text-white", iconBg: "bg-yellow-400/30" },
    info: { bg: "bg-teal-600", text: "text-white", iconBg: "bg-teal-500/30" },
  };
  const t = themes[theme] || themes.info;

  return (
    <div className={`${t.bg} ${t.text} p-6 rounded-2xl shadow-sm relative overflow-hidden`}>
      <Icon size={100} className="absolute -right-6 -bottom-6 opacity-20" />
      <div className="relative z-10">
        <h3 className="font-medium text-lg opacity-90 flex items-center gap-2">
          <Icon size={20} /> {title}
        </h3>
        <p className="text-3xl font-bold mt-4">{value}</p>
        <p className="text-sm opacity-80 mt-1">{subtitle}</p>
      </div>
      <button className={`mt-6 w-full py-2 rounded-lg ${t.iconBg} hover:bg-white/20 transition text-sm font-semibold`}>
        Abrir Detalhes
      </button>
    </div>
  );
}

function SideWidget({ title, icon: Icon, children }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
      <h3 className="text-gray-800 font-semibold mb-4 flex items-center gap-2">
        <Icon className="text-teal-600" size={20} /> {title}
      </h3>
      <div className="flex-1">{children}</div>
    </div>
  );
}

// --- MODAL DE CALENDÁRIO INTERATIVO ---
function CalendarModal({ isOpen, onClose }: any) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date()); // Data clicada

  // Reseta para hoje ao abrir
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      setCurrentDate(today);
      setSelectedDate(today);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(endOfMonth(monthStart));
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

  // Filtra eventos do dia selecionado (para mostrar na lista abaixo)
  const selectedEvents = MOCK_EVENTS.filter(evt => isSameDay(evt.date, selectedDate));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-teal-50">
          <h2 className="text-lg font-bold text-teal-800 flex items-center gap-2">
             <Calendar size={20}/> Agenda Completa
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-teal-100 rounded-full text-teal-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            
            {/* Navegação Mês */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                  <ChevronLeft size={20} />
              </button>
              <span className="text-lg font-semibold text-gray-800 capitalize">
                  {format(currentDate, "MMMM yyyy", { locale: ptBR })}
              </span>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                  <ChevronRight size={20} />
              </button>
            </div>

            {/* Calendário Grid */}
            <div className="bg-white rounded-xl border border-gray-100 p-2 shadow-sm mb-6">
              <div className="grid grid-cols-7 mb-2">
                {weekDays.map((d, i) => (
                  <div key={i} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const hasEvents = MOCK_EVENTS.some(evt => isSameDay(evt.date, day));
                  const isSelected = isSameDay(day, selectedDate);
                  
                  return (
                    <button 
                      key={day.toString()}
                      onClick={() => setSelectedDate(day)}
                      className={clsx(
                        "h-10 flex flex-col items-center justify-center rounded-lg text-sm relative transition-all border-2 border-transparent",
                        !isSameMonth(day, currentDate) ? "text-gray-300" : "text-gray-700 hover:bg-gray-50",
                        
                        // Estilo se for HOJE
                        isToday(day) && !isSelected && "bg-teal-50 text-teal-700 font-bold",
                        
                        // Estilo se estiver SELECIONADO (clicado)
                        isSelected && "bg-teal-600 text-white font-bold shadow-md transform scale-105 z-10",
                        
                        // Borda para indicar que tem evento (se não estiver selecionado)
                        hasEvents && !isSelected && "border-indigo-100"
                      )}
                    >
                      {format(day, "d")}
                      
                      {/* PONTO INDICADOR (Bolinha) */}
                      {hasEvents && (
                        <span className={clsx(
                          "w-1.5 h-1.5 rounded-full absolute bottom-1.5",
                          isSelected ? "bg-white" : "bg-indigo-500"
                        )}></span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Lista de Eventos do Dia Selecionado */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                 Agendamentos em {format(selectedDate, "dd/MM")}
              </h3>
              
              <div className="space-y-2">
                {selectedEvents.length > 0 ? (
                  selectedEvents.map((evt) => (
                    <div key={evt.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-teal-50 hover:border-teal-200 transition-colors cursor-pointer group">
                      <div className={clsx(
                        "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold",
                        evt.type === 'consultation' ? "bg-indigo-100 text-indigo-700" : "bg-fuchsia-100 text-fuchsia-700"
                      )}>
                        {evt.time}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{evt.title}</p>
                        <p className="text-xs text-gray-500 group-hover:text-teal-600">
                          {evt.type === 'consultation' ? 'Consulta Médica' : 'Exame Clínico'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <Clock className="mx-auto mb-2 opacity-20" size={24} />
                    <p className="text-sm">Nenhum evento neste dia.</p>
                    <button className="text-teal-600 text-xs font-bold mt-2 hover:underline">
                      + Adicionar Novo
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// --- PÁGINA PRINCIPAL ---
export default function DashboardPage() {
  const [userName, setUserName] = useState("Doutor(a)");
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("clinica_user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const firstName = user.name.split(" ")[0];
      setUserName(firstName);
    }
  }, []);

  const todayEvents = MOCK_EVENTS.filter(event => isToday(event.date));

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      
      <CalendarModal isOpen={showCalendar} onClose={() => setShowCalendar(false)} />

      <header>
        <h1 className="text-2xl font-bold text-gray-800">
          Olá, {userName}! 👋
        </h1>
        <p className="text-gray-500">Aqui está o resumo da sua clínica hoje.</p>
      </header>

      {/* SESSÃO 1: AÇÕES RÁPIDAS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionButton icon={Calendar} label="Novo Agendamento" colorClass="bg-teal-600 hover:bg-teal-700" />
        <QuickActionButton icon={UserPlus} label="Novo Paciente" colorClass="bg-indigo-600 hover:bg-indigo-700" />
        <QuickActionButton icon={FileText} label="Nova Venda/Orç." colorClass="bg-purple-600 hover:bg-purple-700" />
        <QuickActionButton icon={CreditCard} label="Conta a Pagar" colorClass="bg-fuchsia-700 hover:bg-fuchsia-800" />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA (2/3) */}
        <div className="xl:col-span-2 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Saúde Financeira</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FinancialCard title="A Receber Hoje" value="R$ 1.250,00" subtitle="3 atendimentos previstos" icon={TrendingUp} theme="success" />
              <FinancialCard title="A Pagar Hoje" value="R$ 450,00" subtitle="Contas de consumo" icon={TrendingDown} theme="danger" />
              <FinancialCard title="Recebimentos Vencidos" value="R$ 890,00" subtitle="Cobrar pacientes" icon={DollarSign} theme="warning" />
              <FinancialCard title="Pagamentos Vencidos" value="R$ 0,00" subtitle="Tudo em dia!" icon={CreditCard} theme="info" />
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Atendimentos Recentes</h2>
              <button className="text-teal-600 text-sm hover:underline">Ver todos</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Paciente</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Data</th>
                    <th className="px-6 py-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600"><Users size={16}/></div>
                      Roberto Silva
                    </td>
                    <td className="px-6 py-4"><span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">Concluído</span></td>
                    <td className="px-6 py-4">Hoje, 14:30</td>
                    <td className="px-6 py-4 text-right font-medium">R$ 250,00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* COLUNA DIREITA (1/3) */}
        <div className="space-y-8">
          
          <SideWidget title="Agenda de Hoje" icon={Calendar}>
            {todayEvents.length > 0 ? (
              <div className="space-y-4">
                {todayEvents.map((evt) => (
                  <div key={evt.id} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex flex-col items-center min-w-[3rem]">
                      <span className="text-sm font-bold text-gray-800">{evt.time}</span>
                      <div className={`w-1.5 h-1.5 rounded-full mt-1 ${evt.type === 'consultation' ? 'bg-indigo-400' : 'bg-fuchsia-400'}`}></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 leading-tight">{evt.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 capitalize">
                        {evt.type === 'consultation' ? 'Consulta' : 'Exame'} • Particular
                      </p>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => setShowCalendar(true)}
                  className="w-full mt-2 py-2 text-xs font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  Ver Agenda Completa
                </button>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <Clock className="mx-auto mb-2 opacity-30" size={32} />
                <p className="text-sm">Tudo livre por hoje!</p>
                <button 
                  onClick={() => setShowCalendar(true)}
                  className="mt-4 text-teal-600 text-sm font-medium hover:underline"
                >
                    Ver Calendário
                </button>
              </div>
            )}
          </SideWidget>

          <SideWidget title="Aniversariantes" icon={Users}>
            <div className="bg-indigo-50 text-indigo-800 p-4 rounded-lg text-center text-sm font-medium">
              🎉 Nenhum aniversariante hoje.
            </div>
          </SideWidget>
        </div>
      </div>
    </div>
  );
}