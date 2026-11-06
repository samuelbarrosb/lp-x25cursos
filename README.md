# Landing page: Oficina de Impressão 3D para Iniciantes (X25 Cursos)

Site estático (HTML + CSS + JavaScript puro), sem build e sem dependências.
Pode ser publicado em qualquer hospedagem de arquivos: Hostinger, cPanel, Netlify, Vercel, GitHub Pages, Cloudflare Pages etc.

## Estrutura

```
index.html              página completa (SEO, Open Graph, dados estruturados)
css/styles.css          estilos (tokens de cor no topo do arquivo)
js/config.js            CONFIGURAÇÃO DO FORMULÁRIO  ← editar aqui
js/main.js              validação, máscara, envio, galeria, animações
assets/brand/           logos otimizados, favicon, ícone Apple
assets/img/fotos/       fotos das peças em WebP (600px e 1200px)
assets/img/recortes/    peças e impressora com fundo removido (WebP com transparência)
assets/img/og-image.jpg imagem de compartilhamento (WhatsApp, Instagram, Facebook)
fotos-produto/, foto-impressora/, logo/   ORIGINAIS (não são usados pela página)
```

> As pastas de originais (~21 MB) não precisam ser enviadas para a hospedagem.
> Basta publicar `index.html`, `css/`, `js/` e `assets/`.

## Testar localmente

```bash
python -m http.server 8000
# abrir http://localhost:8000
```

## Formulário de inscrição

**Situação atual:** o projeto não tem backend, banco de dados nem serviço de formulários.
Por isso o formulário funciona assim:

| `formEndpoint` em `js/config.js` | O que acontece ao enviar |
|---|---|
| vazio (padrão atual) | Valida os campos e abre o WhatsApp da X25 **com a mensagem de inscrição já preenchida** (nome, WhatsApp, e-mail). A pessoa toca em "enviar" e a inscrição chega ao WhatsApp (61) 3244-2510. A página informa claramente que falta esse passo e **não** mostra "inscrição recebida". |
| URL preenchida | Envia os dados por `POST` para a URL. Mostra "Inscrição recebida" **somente** se o servidor responder com status 2xx. Em caso de erro ou demora acima de 15 s, mantém os dados preenchidos e oferece concluir pelo WhatsApp. |

### Dados enviados (JSON)

```json
{
  "nome": "Ana Souza",
  "whatsapp": "(61) 98765-4321",
  "whatsapp_digitos": "5561987654321",
  "email": "ana@email.com",
  "oficina": "Impressão 3D para Iniciantes",
  "pagina": "https://seudominio.com.br/",
  "enviado_em": "2026-11-04T10:44:12.736Z",
  "utm_source": "instagram"
}
```

Os parâmetros `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `gclid` e `fbclid` são incluídos automaticamente quando estão presentes na URL da página, o que é útil para medir os anúncios.

### Como conectar (escolha uma opção)

**Opção A: n8n (recomendada se vocês já usam n8n)**
1. Crie um workflow com o nó **Webhook** (método `POST`, *Respond: Immediately* ou um nó *Respond to Webhook* com status 200).
2. Em seguida, conecte o destino: Google Sheets, CRM, e-mail para a equipe, mensagem no WhatsApp etc.
3. Ative o workflow e copie a **Production URL** para `formEndpoint`.
4. Se o n8n estiver em outro domínio, habilite o CORS no webhook (*Allowed Origins* = domínio da landing page).

**Opção B: Google Planilhas (Apps Script)**
1. Na planilha, abra *Extensões → Apps Script* e cole:
   ```js
   function doPost(e) {
     const d = JSON.parse(e.postData.contents);
     SpreadsheetApp.getActiveSheet().appendRow([
       new Date(), d.nome, d.whatsapp, d.email, d.oficina, d.utm_source || "", d.utm_campaign || ""
     ]);
     return ContentService.createTextOutput('{"ok":true}').setMimeType(ContentService.MimeType.JSON);
   }
   ```
2. *Implantar → Nova implantação → App da Web*, com acesso para "Qualquer pessoa". Copie a URL.
3. Em `js/config.js`, use `formEndpoint: "URL_DO_APPS_SCRIPT"` e `formEncoding: "form"`.
   (O Apps Script não aceita a verificação CORS do JSON; com `"form"` o envio é aceito. Nesse caso, troque no script `JSON.parse(e.postData.contents)` por `e.parameter`.)

**Opção C: Formspree / Getform / Basin** (sem programação)
Crie o formulário no serviço, copie a URL de envio para `formEndpoint` e mantenha `formEncoding: "json"`.

### Proteções já incluídas
- Validação no navegador: nome e sobrenome, WhatsApp com DDD (10 ou 11 dígitos, celular começando com 9) e e-mail.
- Campo *honeypot* invisível contra robôs de spam.
- Botão bloqueado durante o envio (evita inscrição duplicada).
- **Recomendado:** valide os dados também no destino (n8n, script ou API), porque validação no navegador pode ser contornada.

## Rastreamento (opcional)
Se o Google Tag Manager ou o Pixel da Meta forem instalados na página, o formulário já dispara:
- `dataLayer.push({ event: "lead_inscricao" })` quando o envio ao endpoint dá certo (e `fbq("track", "Lead")`, se o Pixel existir);
- `dataLayer.push({ event: "lead_whatsapp" })` quando a inscrição é direcionada ao WhatsApp.

## Antes de publicar
- [x] Domínio: o site é publicado em https://x25.com.br/ (GitHub Pages + arquivo `CNAME`, DNS na DigitalOcean). Se o domínio mudar, atualize `CNAME` e as URLs `canonical`, `og:url` e `og:image` em `index.html`.
- [ ] Configure o `formEndpoint` (ou mantenha o modo WhatsApp de forma consciente).
- [ ] Confirme se a X25 tem autorização para divulgar as peças com marcas de terceiros (veja a observação abaixo).

## Observações de conteúdo
- Todo o conteúdo da oficina vem exclusivamente do PDF institucional (oficina "Impressão 3D para iniciantes"). Preço, datas, horários, número de vagas e certificado **não** constam no material e por isso não aparecem na página.
- A galeria mostra duas peças com marcas registradas de terceiros: o mascote do Atlético Mineiro e o topo de bolo com o logotipo da NBA. Se preferir evitar riscos de uso de marca em material publicitário, basta remover os blocos `<button class="g-item">` correspondentes em `index.html` (o layout da galeria no desktop está posicionado para 10 itens; ao remover itens, ajuste as regras `.g-item:nth-child(...)` em `css/styles.css`).
