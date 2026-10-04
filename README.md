# + Beleza — prévia interativa

Site estático em HTML, CSS e JavaScript para o salão e barbearia **+ Beleza**, no Tatuapé. Quatro visualizações compartilham a mesma agenda no `localStorage` do navegador. Sem dependências de produção, build, backend ou pagamentos.

## Navegação

- `index.html`: apresentação, serviços, galeria com as duas fotos da publicação, endereço e Instagram.
- `agendar.html`: serviço → profissional → calendário/horário → dados → confirmação da prévia. Inclui reservas do cliente, remarcação, cancelamento e arquivo de calendário `.ics`.
- `bio.html`: página compacta de links, agendamento, Instagram, mapa e reservas.
- `painel.html`: agenda por profissional ou gestão, visualização semanal, filtros, conclusão de atendimento, remarcação, cancelamento e bloqueios. A gestão também cadastra profissionais e edita preços/durações.

## Abrir localmente

Para manter a agenda compartilhada entre as quatro páginas, sirva a pasta na mesma origem:

```sh
python -m http.server 3100
```

Abra `http://localhost:3100`. O preview consolidado fornecido separadamente reúne as quatro telas em um só HTML.

## Publicar na Vercel

Suba o conteúdo desta pasta para um novo repositório. Importe na Vercel, use framework **Other**, sem comando de build, diretório de saída `.`. `vercel.json` habilita URLs sem extensão, mantendo compatibilidade com os links `.html`.

Não vincular ao projeto iLife Poá: esta é uma entrega independente.

## Dados reais e dados de demonstração

Verificados no perfil público [@maisbelezaest_](https://www.instagram.com/maisbelezaest_/): nome **+ Beleza**, salão e barbearia, biografia informando 8 anos de atuação, proprietário **@alexamorimf**, endereço **Rua Tuiuti, 2910 — Tatuapé, São Paulo**. As duas fotos e o logo são os materiais públicos efetivamente acessados. As fotos pertencem ao [carrossel enviado](https://www.instagram.com/p/DSXOs5dEc7c/). URLs em `assets/sources.json`.

O acesso público não permitiu consultar todo o histórico do perfil. Não foram confirmados telefone, horário comercial, lista de profissionais nem tabela de serviços/preços. Por isso a prévia usa equipe, serviços, valores, duração e expediente ilustrativos, sinalizados na jornada e no painel. O contato real usa Instagram. A página não envia reservas ao salão.

## Persistência e agenda

- Chave principal: `maisbeleza.preview.v1`; rascunho: `maisbeleza.draft.v1`.
- Cada reserva mantém data, horário, profissional, cliente, serviço, duração, valor e status.
- Releitura do armazenamento antes de salvar e validação de sobreposição por profissional, duração, expediente, pausa e bloqueios.
- Reserva cancelada libera o horário; o histórico é preservado.
- Preços e durações alterados se aplicam a reservas novas. As antigas preservam seus dados.
- O rascunho salva automaticamente as escolhas e os dados digitados.
- Alterações de agenda feitas em outras abas da mesma origem atualizam o painel.
- Cada navegador/dispositivo tem sua própria base. A interface de perfis é uma simulação sem autenticação ou proteção de acesso. Dados de exemplo identificados no painel.
- O arquivo `.ics` é identificado como demonstração; não existe integração com Google Calendar ou confirmação externa.

Para testar do zero, remova as duas chaves no armazenamento do navegador. Os exemplos serão recriados na próxima visita.

## Personalizar

`store.js` contém o cadastro inicial de serviços e equipe. Cadastros feitos pelo painel são locais. `app.js` contém a apresentação, contatos e fluxos. `styles.css` e `fonts.css` definem a identidade; fontes e imagens são locais.

A consulta de disponibilidade é exposta como ferramenta somente leitura se o navegador suportar `document.modelContext`. A experiência funciona normalmente sem esse recurso experimental. Não foi possível validar o registro em um navegador com suporte nativo a WebMCP.

## Para uma versão de produção

Substituir os dados ilustrativos pelos aprovados pelo salão e conectar autenticação, permissões por perfil e persistência central. A prevenção de conflitos entre dispositivos exige transação no servidor; `localStorage` é adequado somente para esta prévia.
