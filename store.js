'use strict';
window.MB = (() => {
  const KEY = 'maisbeleza.preview.v1';
  const DRAFT_KEY = 'maisbeleza.draft.v1';
  const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const dateObject = date => new Date(`${date}T12:00:00`);
  const addDays = (date, amount) => { const d = dateObject(date); d.setDate(d.getDate() + amount); return localDate(d); };
  const today = () => localDate();
  const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const money = value => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  const minutes = time => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };
  const timeString = value => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
  const formatDate = (value, options = { day: 'numeric', month: 'long' }) => dateObject(value).toLocaleDateString('pt-BR', options);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const seed = () => {
    const services = [
      { id: 'corte', name: 'Corte & finalização', category: 'Cabelo', duration: 60, price: 110, description: 'Um corte pensado para o seu estilo e a sua rotina.', icon: 'scissors' },
      { id: 'cor', name: 'Cor & iluminação', category: 'Cabelo', duration: 180, price: 290, description: 'Novos tons, luminosidade e um olhar para cada detalhe.', icon: 'sparkles' },
      { id: 'escova', name: 'Escova & movimento', category: 'Cabelo', duration: 45, price: 70, description: 'Leveza, brilho e uma finalização do seu jeito.', icon: 'wind' },
      { id: 'tratamento', name: 'Ritual de tratamento', category: 'Cuidado', duration: 60, price: 100, description: 'Uma pausa para devolver maciez e cuidado aos fios.', icon: 'drop' },
      { id: 'penteado', name: 'Penteado especial', category: 'Cabelo', duration: 90, price: 140, description: 'Para um dia especial ou para se sentir assim.', icon: 'star' },
      { id: 'barba', name: 'Barba & acabamento', category: 'Barbearia', duration: 30, price: 40, description: 'Desenho, precisão e cuidado em cada acabamento.', icon: 'scissors' },
      { id: 'masculino', name: 'Corte masculino', category: 'Barbearia', duration: 45, price: 60, description: 'Do clássico ao contemporâneo, no seu estilo.', icon: 'scissors' }
    ];
    const professionals = [
      { id: 'marina', name: 'Marina Costa', role: 'Cortes, cor & penteados', color: '#c3bba5', services: ['corte', 'cor', 'penteado', 'tratamento'], start: '09:00', end: '19:00', days: [1, 2, 3, 4, 5, 6], demo: true },
      { id: 'rafael', name: 'Rafael Lima', role: 'Barbearia & estilo', color: '#b9c1b1', services: ['masculino', 'barba'], start: '09:00', end: '19:00', days: [1, 2, 3, 4, 5, 6], demo: true },
      { id: 'bianca', name: 'Bianca Alves', role: 'Finalização & cuidado', color: '#d1b3a6', services: ['corte', 'escova', 'penteado', 'tratamento'], start: '10:00', end: '19:00', days: [1, 2, 3, 4, 5, 6], demo: true }
    ];
    let sampleDate = today();
    if (dateObject(sampleDate).getDay() === 0) sampleDate = addDays(sampleDate, 1);
    const bookings = [
      { id: 'demo-1', clientId: 'demo', serviceId: 'corte', professionalId: 'marina', date: sampleDate, time: '10:00', duration: 60, price: 110, name: 'Julia Martins', phone: '11900000001', status: 'confirmed', demo: true },
      { id: 'demo-2', clientId: 'demo', serviceId: 'masculino', professionalId: 'rafael', date: sampleDate, time: '14:00', duration: 45, price: 60, name: 'Pedro Almeida', phone: '11900000002', status: 'confirmed', demo: true },
      { id: 'demo-3', clientId: 'demo', serviceId: 'escova', professionalId: 'bianca', date: sampleDate, time: '15:00', duration: 45, price: 70, name: 'Fernanda Souza', phone: '11900000003', status: 'confirmed', demo: true }
    ];
    return { version: 1, clientId: uid(), services, professionals, bookings };
  };
  let storageError = false;
  const validState = value => value?.version === 1 && typeof value.clientId === 'string' && Array.isArray(value.services) && Array.isArray(value.professionals) && Array.isArray(value.bookings);
  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const state = JSON.parse(raw); if (validState(state)) return state; }
      const state = seed(); localStorage.setItem(KEY, JSON.stringify(state)); return state;
    } catch { storageError = true; return fallback; }
  }
  const fallback = seed();
  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); storageError = false; }
    catch { storageError = true; throw new Error('Não foi possível salvar. Libere o armazenamento do navegador e tente novamente.'); }
    window.dispatchEvent(new CustomEvent('mb:updated'));
  }
  function draft(value) {
    if (value !== undefined) { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(value)); } catch { storageError = true; } return value; }
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}'); } catch { return {}; }
  }
  function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch {} }
  function eligible(state, serviceId, professionalId = 'any') { return state.professionals.filter(p => p.services.includes(serviceId) && (professionalId === 'any' || professionalId === p.id)); }
  function isAvailable(state, serviceId, professionalId, date, time, excludeId = '') {
    const service = state.services.find(s => s.id === serviceId), professional = state.professionals.find(p => p.id === professionalId);
    if (!service || !professional || !/^\d{4}-\d{2}-\d{2}$/.test(date) || localDate(dateObject(date)) !== date || !/^\d{2}:\d{2}$/.test(time)) return false;
    if (!professional.services.includes(serviceId) || !professional.days.includes(dateObject(date).getDay()) || date < today() || date > addDays(today(), 90)) return false;
    const reservedDuration = excludeId ? state.bookings.find(b => b.id === excludeId)?.duration : null;
    const start = minutes(time), end = start + (reservedDuration || service.duration);
    if (start < minutes(professional.start) || end > minutes(professional.end) || start < 13 * 60 && end > 12 * 60) return false;
    if (new Date(`${date}T${time}:00`).getTime() <= Date.now()) return false;
    return !state.bookings.some(b => b.id !== excludeId && b.professionalId === professionalId && b.date === date && b.status !== 'cancelled' && start < minutes(b.time) + b.duration && end > minutes(b.time));
  }
  function slots(state, serviceId, professionalId, date, excludeId = '') {
    const people = eligible(state, serviceId, professionalId); const result = [];
    for (let m = 8 * 60; m < 20 * 60; m += 30) {
      const time = timeString(m), professional = people.find(p => isAvailable(state, serviceId, p.id, date, time, excludeId));
      if (professional) result.push({ time, professionalId: professional.id });
    }
    return result;
  }
  function book(input) {
    const state = read(), service = state.services.find(s => s.id === input.serviceId);
    if (!service) throw new Error('Escolha um serviço válido.');
    if (!String(input.name || '').trim() || String(input.name).trim().length < 3) throw new Error('Informe seu nome completo.');
    const phone = String(input.phone || '').replace(/\D/g, '');
    if (!/^\d{10,11}$/.test(phone)) throw new Error('Informe um telefone válido com DDD.');
    const slot = slots(state, input.serviceId, input.professionalId, input.date).find(s => s.time === input.time);
    if (!slot) throw new Error('Esse horário acabou de ficar indisponível. Escolha outro horário.');
    const booking = { id: uid(), clientId: state.clientId, serviceId: service.id, professionalId: slot.professionalId, date: input.date, time: input.time, duration: service.duration, price: service.price, name: String(input.name).trim().slice(0, 100), phone, notes: String(input.notes || '').trim().slice(0, 300), status: 'confirmed', createdAt: new Date().toISOString() };
    state.bookings.push(booking); save(state); clearDraft(); return booking;
  }
  function updateBooking(id, patch) {
    const state = read(), booking = state.bookings.find(b => b.id === id);
    if (!booking) throw new Error('Reserva não encontrada.');
    if (patch.status && !['confirmed', 'completed', 'cancelled'].includes(patch.status)) throw new Error('Status inválido.');
    if (booking.status === 'cancelled' && patch.status !== 'cancelled') throw new Error('Uma reserva cancelada não pode ser alterada. Faça um novo agendamento.');
    if (patch.date || patch.time || patch.professionalId) {
      if (booking.status !== 'confirmed') throw new Error('Somente reservas confirmadas podem ser remarcadas.');
      const next = { ...booking, ...patch };
      if (!isAvailable(state, next.serviceId, next.professionalId, next.date, next.time, id)) throw new Error('Horário indisponível para esse profissional. Selecione outra opção.');
    }
    Object.assign(booking, patch); save(state); return booking;
  }
  function addProfessional(input) {
    const state = read();
    if (input.name.trim().length < 3 || !input.services.length || minutes(input.start) >= minutes(input.end)) throw new Error('Preencha o nome, ao menos um serviço e um horário de trabalho válido.');
    state.professionals.push({ ...input, id: uid(), name: input.name.trim().slice(0, 80), role: input.role.trim().slice(0, 80), color: '#c8bda4', days: [1, 2, 3, 4, 5, 6], demo: true });
    save(state);
  }
  function addBlock(input) {
    const state = read(), p = state.professionals.find(p => p.id === input.professionalId);
    const start = minutes(input.time), end = minutes(input.end);
    if (!p || input.date < today() || !p.days.includes(dateObject(input.date).getDay()) || start >= end || start < minutes(p.start) || end > minutes(p.end)) throw new Error('Escolha um período válido dentro do expediente.');
    if (state.bookings.some(b => b.professionalId === p.id && b.date === input.date && b.status !== 'cancelled' && start < minutes(b.time) + b.duration && end > minutes(b.time))) throw new Error('Já existe uma reserva ou bloqueio nesse período.');
    state.bookings.push({ id: uid(), type: 'block', professionalId: p.id, date: input.date, time: input.time, duration: end - start, name: 'Horário bloqueado', notes: input.notes.slice(0, 150), status: 'confirmed' }); save(state);
  }
  function editService(id, price, duration) {
    const state = read(), service = state.services.find(s => s.id === id);
    if (!service || !Number.isFinite(price) || price < 0 || !Number.isInteger(duration) || duration < 15 || duration > 480) throw new Error('Informe um valor e duração válidos.');
    Object.assign(service, { price, duration }); save(state);
  }
  return { KEY, read, save, draft, clearDraft, today, localDate, addDays, dateObject, money, minutes, timeString, formatDate, escape, eligible, slots, isAvailable, book, updateBooking, addProfessional, addBlock, editService, storageFailed: () => storageError };
})();
