import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Sobe para 20 usuários em 30s
    { duration: '1m', target: 20 },  // Mantém 20 usuários por 1m
    { duration: '20s', target: 0 },  // Desce para 0 usuários
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% das requisições devem ser < 500ms
    http_req_failed: ['rate<0.01'],   // Falha de menos de 1%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:5000';

export default function () {
  // Simula o carregamento do Dashboard (várias chamadas simultâneas)
  const responses = http.batch([
    ['GET', `${BASE_URL}/api/pessoas`],
    ['GET', `${BASE_URL}/api/transacoes?pageSize=8`],
    ['GET', `${BASE_URL}/api/totais/por-pessoa`],
  ]);

  check(responses[0], { 'Status de Pessoas é 200': (r) => r.status === 200 });
  check(responses[1], { 'Status de Transacoes é 200': (r) => r.status === 200 });
  check(responses[2], { 'Status de Totais é 200': (r) => r.status === 200 });

  sleep(1);
}
