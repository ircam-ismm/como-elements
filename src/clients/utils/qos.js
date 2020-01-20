// minimalistic, non subtle QoS
// to improved with the time...
export default function initQoS(client) {
  const start = new Date();

  client.socket.addListener('close', () => {
    const end = new Date();

    document.body.style.backgroundColor = 'white';
    document.body.innerHTML = `
      <h1 style="color: #000000; font-size: 20px">socket closed</h1>
      <p style="color: #000000;">start: ${start.toString()}</p>
      <p style="color: #000000;">end: ${end.toString()}</p>
    `;

    // setTimeout(() => window.location.reload(true), 10000);
  });

  client.socket.addListener('error', (err) => {
    const end = new Date();

    document.body.style.backgroundColor = 'orange';
    document.body.innerHTML = `
      <h1 style="color: #000000; font-size: 20px">socket error</h1>
      <p style="color: #000000;">start: ${start.toString()}</p>
      <p style="color: #000000;">end: ${end.toString()}</p>
    `;

    // setTimeout(() => window.location.reload(true), 10000);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.location.reload(true);
    }
  }, false);
}
