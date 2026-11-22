/** Los enlaces HTML ya incluyen el teléfono y funcionan sin JavaScript.
 * Se añade un saludo solo a los enlaces que no lo incluyen.
 */
(() => {
  const message = 'Hola, JJ-TI. Me gustaría conocer sus servicios porque necesito ayuda con tecnología para mi empresa.';
  document.querySelectorAll('a[href^="https://wa.me/"]').forEach((link) => {
    const url = new URL(link.href);
    if (!url.searchParams.has('text')) {
      url.searchParams.set('text', message);
      link.href = url.href;
    }
  });
})();
