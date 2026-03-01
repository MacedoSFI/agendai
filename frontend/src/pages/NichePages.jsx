import React from 'react';
import NichePage from '../components/NichePage';

const NICHOS = {
  barbearia: {
    icon: '✂️',
    name: 'Barbearias',
    color: '#f6ad55',
    headline: 'Sua barbearia lotada, sem confusão na agenda',
    subheadline: 'Chega de cliente marcando por WhatsApp e depois não aparecendo. O AgendAI organiza tudo automaticamente e ainda confirma o horário pelo WhatsApp.',
    cta: 'Organizar minha barbearia',
    services: [
      { client: 'Carlos Mendes', service: 'Corte + Barba', time: '09:00', color: '#f6ad55' },
      { client: 'Rafael Lima', service: 'Corte Degradê', time: '09:45', color: '#7c6af7' },
      { client: 'Bruno Costa', service: 'Barba Completa', time: '10:30', color: '#4fd1c5' },
    ],
    painPoints: [
      'Clientes marcam horário no WhatsApp e você precisa anotar em papel ou planilha',
      'Cliente some no dia do horário e você fica com o tempo vago',
      'Dois clientes marcam o mesmo horário por engano',
      'Você passa horas respondendo mensagens de confirmação',
    ],
    benefits: [
      'Clientes veem os horários disponíveis e marcam sozinhos em segundos',
      'Confirmação automática no WhatsApp logo após o agendamento',
      'Lembrete automático 24h antes — zero no-show',
      'Zero conflito de horário — o sistema bloqueia automaticamente',
    ],
    testimonial: {
      text: 'Antes eu perdia uns 3 clientes por semana por confusão de horário. Agora a agenda está sempre organizada e meu faturamento aumentou.',
      name: 'André Barbosa',
      role: 'Proprietário · Barbearia Classic',
    },
  },

  clinica: {
    icon: '💆',
    name: 'Clínicas Estéticas',
    color: '#f687b3',
    headline: 'Mais clientes, menos trabalho administrativo',
    subheadline: 'Gerencie procedimentos, clientes e horários de toda a sua clínica em um só lugar. Com WhatsApp automático para cada agendamento.',
    cta: 'Organizar minha clínica',
    services: [
      { client: 'Fernanda Silva', service: 'Limpeza de Pele', time: '10:00', color: '#f687b3' },
      { client: 'Juliana Matos', service: 'Drenagem Linfática', time: '11:30', color: '#7c6af7' },
      { client: 'Patrícia Nunes', service: 'Design de Sobrancelha', time: '13:00', color: '#4fd1c5' },
    ],
    painPoints: [
      'Agenda lotada de papéis e anotações que se perdem',
      'Clientes ligam para confirmar horário ocupando seu tempo',
      'Difícil saber quanto faturou no mês com cada procedimento',
      'Equipe sem visibilidade clara da agenda do dia',
    ],
    benefits: [
      'Agenda digital acessível de qualquer dispositivo em tempo real',
      'WhatsApp automático confirma e lembra os clientes por você',
      'Relatório mensal mostra faturamento por procedimento',
      'Toda a equipe vê a agenda atualizada simultaneamente',
    ],
    testimonial: {
      text: 'A clínica tem 3 profissionais e gerenciar a agenda era um caos. Agora cada uma tem sua própria agenda e tudo flui perfeitamente.',
      name: 'Dra. Camila Rocha',
      role: 'Esteticista · Clínica Bella Vita',
    },
  },

  psicologo: {
    icon: '🧠',
    name: 'Psicólogos',
    color: '#76e4f7',
    headline: 'Foque no paciente. A agenda cuida de si mesma.',
    subheadline: 'Organize suas sessões, confirme presença automaticamente e mantenha o histórico de cada paciente — tudo com segurança e discrição.',
    cta: 'Organizar meu consultório',
    services: [
      { client: 'Ana P.', service: 'Sessão Individual', time: '09:00', color: '#76e4f7' },
      { client: 'João M.', service: 'Avaliação Inicial', time: '10:00', color: '#7c6af7' },
      { client: 'Maria L.', service: 'Sessão Individual', time: '11:00', color: '#4fd1c5' },
    ],
    painPoints: [
      'Pacientes esquecem o horário e precisam ser lembrados manualmente',
      'Cancelamentos de última hora deixam horários vagos sem aviso',
      'Difícil manter controle de sessões realizadas por paciente',
      'Tempo perdido respondendo mensagens de confirmação',
    ],
    benefits: [
      'Lembrete automático 24h antes — paciente chega preparado',
      'Histórico completo de sessões e observações por paciente',
      'Confirmação discreta por WhatsApp sem expor informações sensíveis',
      'Relatório mensal de sessões realizadas e faturamento',
    ],
    testimonial: {
      text: 'Reduzi os cancelamentos em mais de 70% depois que comecei a usar o lembrete automático. Minha agenda ficou muito mais previsível.',
      name: 'Dra. Beatriz Santos',
      role: 'Psicóloga CRP · Consultório Particular',
    },
  },

  nutricionista: {
    icon: '🥗',
    name: 'Nutricionistas',
    color: '#68d391',
    headline: 'Organize consultas e acompanhamentos com facilidade',
    subheadline: 'Do retorno ao acompanhamento mensal — gerencie todos os seus pacientes e consultas em um sistema simples e profissional.',
    cta: 'Organizar meu consultório',
    services: [
      { client: 'Mariana Costa', service: 'Consulta Inicial', time: '08:00', color: '#68d391' },
      { client: 'Pedro Alves', service: 'Retorno 30 dias', time: '09:00', color: '#7c6af7' },
      { client: 'Larissa Souza', service: 'Bioimpedância', time: '10:00', color: '#f6ad55' },
    ],
    painPoints: [
      'Pacientes somem entre uma consulta e outra sem acompanhamento',
      'Agenda manual dificulta visualizar retornos programados',
      'Tempo gasto lembrando manualmente cada paciente do retorno',
      'Sem visão clara do faturamento mensal por tipo de consulta',
    ],
    benefits: [
      'Retornos programados com lembrete automático no WhatsApp',
      'Visualização semanal clara de todas as consultas agendadas',
      'Histórico de cada paciente com observações e evolução',
      'Relatório mensal de consultas por tipo e faturamento total',
    ],
    testimonial: {
      text: 'Meu índice de retorno aumentou muito depois que passei a enviar lembretes automáticos. Os pacientes adoram receber a confirmação na hora.',
      name: 'Dra. Isabela Ferreira',
      role: 'Nutricionista CRN · Atendimento Particular',
    },
  },
};

export function BarbeariaNichePage() {
  return <NichePage nicho={NICHOS.barbearia} />;
}

export function ClinicaNichePage() {
  return <NichePage nicho={NICHOS.clinica} />;
}

export function PsicologoNichePage() {
  return <NichePage nicho={NICHOS.psicologo} />;
}

export function NutricionistaNichePage() {
  return <NichePage nicho={NICHOS.nutricionista} />;
}
