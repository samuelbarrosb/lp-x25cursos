/**
 * Configuração do formulário de inscrição.
 * Veja o README.md, seção "Formulário de inscrição", para o passo a passo.
 */
window.X25_CONFIG = {
  /**
   * URL que recebe as inscrições via POST (JSON).
   * Exemplos: webhook do n8n, Make, Zapier, Google Apps Script, Formspree, API própria.
   *
   * Enquanto estiver vazio, o formulário NÃO finge que enviou: ele valida os dados
   * e abre o WhatsApp da X25 com a mensagem de inscrição já preenchida para a
   * pessoa só tocar em "enviar".
   */
  formEndpoint: "",

  /** Formato do corpo enviado ao endpoint: "json" (padrão) ou "form" (application/x-www-form-urlencoded). */
  formEncoding: "json",

  /** WhatsApp da X25 (DDI + DDD + número, só dígitos). */
  whatsappNumber: "556132442510",

  /** Nome da oficina, enviado junto com cada inscrição. */
  oficina: "Impressão 3D para Iniciantes",
};
