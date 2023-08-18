import { nextStep } from '../space';
/* eslint-disable no-restricted-globals */
self.addEventListener('message', (e: MessageEvent) => {
  console.log(e.data);
  // const next = nextStep(
  //   e.data.nodos,
  //   e.data.pos,
  //   e.data.nuevaGeneracion,
  //   e.data.valoresSistema
  // );
  self.postMessage(e.data);
}, false);
