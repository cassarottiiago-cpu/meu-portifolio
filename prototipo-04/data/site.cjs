// Configuração de publicação.
// DOMINIO: endereço final, sem barra no fim (ex.: 'https://iagocassarotti.com'). Ativa canonical, hreflang, sitemap e a
//   imagem de pré-visualização (og:image), que WhatsApp e LinkedIn só aceitam com endereço completo.
//   Se ficar vazio e o build rodar na Vercel, usa o domínio de produção do projeto (VERCEL_PROJECT_PRODUCTION_URL).
// indexar: false volta a esconder o site dos buscadores (noindex).
// email: endereço profissional; com ele, o fechamento ganha o botão de e-mail com "copiar".
const DOMINIO = '';
const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
module.exports = {
  url: (process.env.SITE_URL || DOMINIO || (vercel ? 'https://' + vercel : '')).replace(/\/$/, ''),
  indexar: true,
  email: '',
  whatsapp: 'https://wa.me/5543988174922'
};
