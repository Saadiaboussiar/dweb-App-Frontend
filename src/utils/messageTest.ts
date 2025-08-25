export function listenForMessages() {
  const cleanListener = (event: MessageEvent) => {
    console.log('Message received:', event);
    // Never return true
  };
  
  window.addEventListener('message', cleanListener);
  return () => window.removeEventListener('message', cleanListener);
}