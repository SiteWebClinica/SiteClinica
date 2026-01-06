"use client";

import { useState } from "react";
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
import { ChevronLeft, ChevronRight, Clock, MapPin, Plus, User } from "lucide-react";
import clsx from "clsx"; // Ajuda a combinar classes condicionalmente

// --- MOCK DE DADOS (Simulação de agendamentos) ---
// Em um app real, isso viria do banco de dados (Prisma)
const MOCK_EVENTS = [
  {
    id: 1,
    date: new Date(), // Hoje
    title: "Consulta: Roberto Silva",
    type: "consultation", // consultation, exam, surgery
    time: "14:30",
  },
  {
    id: 2,
    date: new Date(), // Hoje
    title: "Exame: Ana Julia",
    type: "exam",
    time: "16:00",
  },
  {
    id: 3,
    date: new Date(new Date().setDate(new Date().getDate() + 2)), // Daqui a 2 dias
    title: "Retorno: Carlos Edu",
    type: "consultation",
    time: "09:00",
  },
];

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // --- NAVEGAÇÃO DO CALENDÁRIO ---
  function nextMonth() {
    setCurrentDate(addMonths(currentDate, 1));
  }

  function prevMonth() {
    setCurrentDate(subMonths(currentDate, 1));
  }

  function jumpToToday() {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  }

  // --- GERAÇÃO DOS DIAS ---
  // 1. Pega o primeiro e último dia do mês atual
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);

  // 2. Pega o início da semana do primeiro dia (pode ser no mês anterior)
  // e o fim da semana do último dia (pode ser no mês seguinte)
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  // 3. Gera todos os dias entre essas datas
  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  // Dias da semana para o cabeçalho
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Filtra eventos do dia selecionado
  const selectedDayEvents = MOCK_EVENTS.filter((event) => 
    isSameDay(event.date, selectedDate)
  );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-6">
      
      {/* CABEÇALHO DA PÁGINA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Agenda
            <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium border border-teal-100">
              {format(currentDate, "MMMM yyyy", { locale: ptBR })}
            </span>
          </h1>
          <p className="text-gray-500 text-sm">Gerencie consultas e horários.</p>
        </div>

        <div className="flex items-center gap-2">
            <button onClick={jumpToToday} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Hoje
            </button>
            <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm shadow-teal-200">
                <Plus size={18} />
                <span className="hidden sm:inline">Novo Agendamento</span>
            </button>
        </div>
      </div>

      {/* ÁREA PRINCIPAL (GRID) */}
      <div className="flex flex-1 gap-8 overflow-hidden">
        
        {/* CALENDÁRIO (ESQUERDA) */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            
            {/* Header do Calendário (Navegação) */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <span className="font-semibold text-lg text-gray-700 capitalize">
                    {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                </span>
                <div className="flex items-center gap-1">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Grid dos Dias da Semana */}
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
                {weekDays.map((day) => (
                    <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid dos Dias (Datas) */}
            <div className="flex-1 grid grid-cols-7 grid-rows-6">
                {calendarDays.map((day, dayIdx) => {
                    // Verifica se tem eventos neste dia
                    const hasEvents = MOCK_EVENTS.some(evt => isSameDay(evt.date, day));

                    return (
                        <div 
                            key={day.toString()}
                            onClick={() => setSelectedDate(day)}
                            className={clsx(
                                "relative border-b border-r border-gray-100 p-2 cursor-pointer transition-colors hover:bg-gray-50 flex flex-col items-start justify-start gap-1",
                                !isSameMonth(day, currentDate) && "bg-gray-50/50 text-gray-400", // Dias de outro mês
                                isSameMonth(day, currentDate) && "bg-white",
                                isSameDay(day, selectedDate) && "ring-2 ring-inset ring-teal-500 z-10" // Dia selecionado
                            )}
                        >
                            <span 
                                className={clsx(
                                    "text-sm w-7 h-7 flex items-center justify-center rounded-full font-medium",
                                    isToday(day) 
                                        ? "bg-teal-600 text-white" 
                                        : "text-gray-700"
                                )}
                            >
                                {format(day, "d")}
                            </span>

                            {/* Bolinhas de Evento (Miniatura) */}
                            {hasEvents && (
                                <div className="flex gap-1 px-1">
                                    {MOCK_EVENTS.filter(e => isSameDay(e.date, day)).map((evt, i) => (
                                        <div 
                                            key={i} 
                                            className={clsx(
                                                "w-2 h-2 rounded-full",
                                                evt.type === 'consultation' ? "bg-indigo-400" : "bg-fuchsia-400"
                                            )} 
                                            title={evt.title}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* DETALHES DO DIA (DIREITA - SIDEBAR) */}
        <div className="w-80 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-teal-50 to-white">
                <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Selecionado</h2>
                <p className="text-3xl font-bold text-gray-800 mt-1 capitalize">
                    {format(selectedDate, "EEEE", { locale: ptBR })}
                </p>
                <p className="text-teal-600 font-medium">
                    {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                </p>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {selectedDayEvents.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <Clock className="mx-auto mb-3 opacity-20" size={48} />
                        <p className="text-sm">Nenhum agendamento para este dia.</p>
                        <button className="mt-4 text-teal-600 text-sm font-medium hover:underline">
                            + Adicionar horário
                        </button>
                    </div>
                ) : (
                    selectedDayEvents.map((event) => (
                        <div key={event.id} className="group flex gap-4 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all cursor-pointer">
                            {/* Horário */}
                            <div className="flex flex-col items-center pt-1">
                                <span className="text-sm font-bold text-gray-700">{event.time}</span>
                                <div className="h-full w-0.5 bg-gray-100 mt-2 group-hover:bg-teal-200 transition-colors"></div>
                            </div>
                            
                            {/* Card do Evento */}
                            <div className="flex-1">
                                <div className={clsx(
                                    "w-full p-3 rounded-lg border-l-4 shadow-sm",
                                    event.type === 'consultation' 
                                        ? "bg-indigo-50 border-indigo-500" 
                                        : "bg-fuchsia-50 border-fuchsia-500"
                                )}>
                                    <h4 className="font-semibold text-gray-800 text-sm">{event.title}</h4>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                        <User size={12} />
                                        <span>Particular</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

      </div>
    </div>
  );
}