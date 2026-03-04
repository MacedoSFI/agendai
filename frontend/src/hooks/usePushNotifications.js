// src/hooks/usePushNotifications.js
import { useEffect, useState } from 'react';
import api from '../utils/api';

// Converte base64 para Uint8Array (necessário para VAPID)
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = window.atob(base64);
  return new Uint8Array([...raw].map(c => c.charCodeAt(0)));
}

export function usePushNotifications() {
  const [status, setStatus] = useState('idle'); // idle | requesting | granted | denied | unsupported

  useEffect(() => {
    // Só roda se o browser suporta
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported');
      return;
    }

    // Se já foi concedida permissão antes, registra direto
    if (Notification.permission === 'granted') {
      subscribe();
    } else if (Notification.permission === 'default') {
      // Aguarda 3s para não pedir permissão imediatamente ao logar
      const t = setTimeout(() => requestPermission(), 3000);
      return () => clearTimeout(t);
    } else {
      setStatus('denied');
    }
  }, []);

  const requestPermission = async () => {
    setStatus('requesting');
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await subscribe();
    } else {
      setStatus('denied');
    }
  };

  const subscribe = async () => {
    try {
      // Registra o service worker
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Busca chave pública do backend
      const { data } = await api.get('/push/vapid-public-key');
      const appServerKey = urlBase64ToUint8Array(data.publicKey);

      // Verifica se já tem subscription ativa
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: appServerKey,
        });
      }

      // Envia subscription para o backend
      await api.post('/push/subscribe', {
        endpoint: sub.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')))),
          auth:   btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')))),
        },
      });

      setStatus('granted');
    } catch (err) {
      console.error('Push subscribe error:', err);
      setStatus('denied');
    }
  };

  return { status, requestPermission };
}
