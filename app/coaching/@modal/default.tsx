// Fallback för popup-slotten vid hård navigering (direktlänk/refresh) på
// sidor som inte själva matchar en intercepterad popup-route nedan — enligt
// Next.js parallel-routes-konventionen ska den då rendera null istället för
// 404, se node_modules/next/dist/docs/01-app/.../parallel-routes.md.
export default function ModalDefault() {
  return null;
}
