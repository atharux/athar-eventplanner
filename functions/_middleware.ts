export const onRequest = async (context) => {
  const host = context.request.headers.get('Host') || '\;
  // Block all .pages.dev access — force traffic through custom domain + Worker gate
  if (host.endsWith('.pages.dev')) {
    return new Response('Not Found', { status: 404 });
  }
  return context.next();
};
