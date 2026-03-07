// src/data/blogData.js
// Para adicionar um post: copie um objeto do array e edite os campos.

export const categories = [
  { id: 'barbearia',       label: 'Barbearia',         color: '#7c6af7' },
  { id: 'estetica',        label: 'Estética',           color: '#f687b3' },
  { id: 'saude',           label: 'Saúde & Bem-estar',  color: '#4fd1c5' },
  { id: 'dicas-negocio',   label: 'Dicas de Negócio',   color: '#f6ad55' },
  { id: 'produtividade',   label: 'Produtividade',      color: '#68d391' },
];

export const posts = [
  {
    id: 1,
    slug: 'como-reduzir-faltas-na-barbearia',
    title: 'Como reduzir faltas e no-shows na sua barbearia',
    excerpt: 'Clientes que marcam e não aparecem são um dos maiores vilões do faturamento. Veja estratégias simples para reduzir esse problema.',
    category: 'barbearia',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
    date: '2026-03-01',
    readTime: '4 min',
    content: `
Faltas sem aviso prévio podem representar até 20% da receita perdida em uma barbearia. A boa notícia é que existem formas simples de reduzir esse número drasticamente.

**1. Solicite um sinal no agendamento**

Cobrar um valor antecipado — mesmo que pequeno, como R$ 20 — filtra clientes que não têm compromisso real com o horário. Quem pagou, aparece.

**2. Envie lembretes automatizados**

Uma mensagem 24h antes do horário reduz faltas em até 40%. Com o AgendAI, esse lembrete pode ser configurado para ir automaticamente.

**3. Tenha uma política clara de cancelamento**

Deixe visível: cancelamentos com menos de 2h de antecedência perdem o sinal. Comunique isso no momento do agendamento.

**4. Mantenha lista de espera**

Se um cliente cancelar, você pode preencher o horário rapidamente com quem está aguardando.

Implemente uma dessas estratégias por semana e observe a diferença no seu faturamento.
    `.trim(),
  },
  {
    id: 2,
    slug: 'agenda-online-aumenta-faturamento',
    title: 'Por que ter uma agenda online aumenta seu faturamento',
    excerpt: 'Profissionais que oferecem agendamento online recebem até 30% mais clientes. Entenda o motivo e como começar.',
    category: 'dicas-negocio',
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80',
    date: '2026-03-04',
    readTime: '5 min',
    content: `
A maioria dos clientes busca serviços fora do horário comercial — à noite, no fim de semana, durante o almoço. Se você só aceita agendamentos por telefone ou WhatsApp, está perdendo todos esses clientes.

**O problema do agendamento manual**

Responder mensagens individualmente consome tempo, gera erros de horário e cria uma experiência ruim para o cliente que precisa esperar sua resposta.

**Agenda online: disponível 24h**

Com um link de agendamento, seu cliente agenda sozinho, no horário que quiser, sem precisar esperar. Você recebe a notificação e pronto.

**Números que comprovam**

Profissionais que migram para agenda online relatam entre 20% e 35% de aumento no volume de agendamentos nos primeiros 3 meses.

**Como começar**

O AgendAI oferece um link personalizado do tipo agendai.com/agendar/seu-nome. Compartilhe no Instagram, WhatsApp e Google. Em minutos você já está recebendo agendamentos online.
    `.trim(),
  },
  {
    id: 3,
    slug: 'cuidados-pos-procedimento-estetico',
    title: '5 cuidados essenciais pós-procedimento estético para passar aos clientes',
    excerpt: 'Orientar bem o cliente após o procedimento é parte do serviço. Veja o que não pode faltar nas suas instruções pós-atendimento.',
    category: 'estetica',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
    date: '2026-03-06',
    readTime: '3 min',
    content: `
O atendimento não termina quando o cliente sai da sua cabine. O que ele faz nas horas seguintes impacta diretamente o resultado — e a sua reputação.

**1. Hidratação**

Independente do procedimento, a pele precisa de hidratação adequada. Indique um produto compatível com o tipo de pele do cliente.

**2. Protetor solar**

Obrigatório após qualquer procedimento que envolva esfoliação, peeling ou laser. A pele fica mais sensível à radiação UV.

**3. Evitar calor excessivo**

Sauna, banho muito quente e atividade física intensa devem ser evitados nas primeiras 24-48h após procedimentos faciais.

**4. Não manipular a área tratada**

Apertar, coçar ou esfregar pode comprometer o resultado e causar inflamação.

**5. Retorno programado**

Sempre agende o retorno antes do cliente sair. Isso garante fidelização e acompanhamento do resultado.

Crie um cartão ou mensagem padrão com essas orientações para enviar após cada atendimento.
    `.trim(),
  },
  {
    id: 4,
    slug: 'produtividade-para-autonomos',
    title: 'Como organizar seu dia como profissional autônomo e atender mais sem se esgotar',
    excerpt: 'Trabalhar por conta própria exige disciplina e organização. Veja técnicas simples para ser mais produtivo sem comprometer sua saúde.',
    category: 'produtividade',
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80',
    date: '2026-03-07',
    readTime: '5 min',
    content: `
Ser autônomo significa que você é o chefe — mas também o recepcionista, o financeiro e o marketing. Sem organização, o dia vira um caos.

**Bloqueie horários para tarefas administrativas**

Reserve 30 minutos no início ou fim do dia para responder mensagens, confirmar agendamentos e fazer o controle financeiro. Não misture com horários de atendimento.

**Defina um limite de atendimentos por dia**

Mais clientes nem sempre significa mais lucro. Atender além do limite físico reduz a qualidade do serviço e aumenta o risco de esgotamento.

**Use a agenda como ferramenta de controle**

Uma agenda digital mostra claramente quanto tempo você tem disponível, evita conflitos e te dá uma visão real do seu mês.

**Tire dias de folga de verdade**

Profissionais que não descansam rendem menos. Programe pelo menos um dia completo de folga por semana.

**Precifique corretamente**

Atender menos clientes por um valor justo é mais sustentável do que lotação máxima com preços baixos.
    `.trim(),
  },
];
