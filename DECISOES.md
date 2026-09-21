# Rei Burgão — decisões travadas

Cada linha aqui foi pedida pelo Matheus e **não muda sem ordem dele**.
Antes de publicar qualquer alteração, conferir esta lista e garantir que
nada abaixo foi desfeito.

Última revisão: 21/09/2026

## VERSÃO TRAVADA

O Matheus mandou travar o estado atual: *"salva tudo que fizemos e trava, você
só vai mexer no que eu pedir"*.

- **Versão travada:** `travada-2026-09-21`
- **Commit:** `cb545c32a70f36fd7e578b5a330738522eee5ad8`
- **Cópia na máquina:** `/home/matheus/projetos/reiburgao-TRAVADA-2026-09-21/`
- Conferido arquivo por arquivo que a pasta da máquina é idêntica ao que está
  publicado (11 arquivos, todos batendo).

Se alguma coisa quebrar, dá para voltar a este ponto exato a qualquer momento.

**Regra a partir daqui:** nenhuma alteração sai sem pedido explícito dele. Toda
mudança nova é conferida contra esta lista antes de publicar.

## Site do cliente

- WhatsApp dos pedidos: **(11) 97638-5099** (número real da loja). O número do
  Matheus (11 98809-7416) não pode voltar.
- Endereço oficial: **R. Eunice Cerqueira Innocencio, 245 - Jardim Quaresmeira,
  Suzano - SP, 08671-330**.
- Google Maps e Waze levam pelo **endereço escrito**, nunca por coordenada.
- **Horário:** abre **18:00**, fecha **00:00**, de **terça a domingo**.
  Fecha segunda-feira. Confirmado pelo Matheus em 21/09/2026.
- Formas de receber: **Entrega**, **Retirada** e **No restaurante**.
  Não existe "mesa" nem campo de número de mesa.
- Rodapé do carrinho compacto: o total não pode voltar a ocupar mais de um
  terço da tela do celular.
- Carrinho **esvazia depois de enviar** o pedido e **expira em 3 horas**.
  Nome e telefone continuam preenchidos de propósito.
- A aparência e os programas são carregados com **carimbo de tempo** que muda
  a cada 2 minutos, para o cliente nunca ficar com versão antiga.

## Painel da loja

- Botões do topo discretos: **Loja aberta/fechada**, **Atualizar**, **Senha**,
  **Sair**. Sem emojis em botão nenhum do painel.
- Tamanhos pequenos e uniformes em filtros, abas, campos e botões. O critério
  do Matheus é "profissional, não meia boca".
- Botão **Atualizar** joga fora o que estiver guardado e recarrega.
- Botão **Senha** troca a senha da loja.
- Botão **Loja aberta / Loja fechada** manda no selo do site.
  *(falta liberar a permissão de leitura pública no Firebase)*
- Som do pedido alto, com insistência a cada 20 segundos até alguém atender.
- Avisar o cliente: o botão muda de texto conforme a etapa, e ao marcar
  "saiu para entrega" o painel já pergunta se quer mandar a mensagem.
- Mensagens ao cliente **sem emoji** (no aparelho dele saíam como quadradinho).
  Acentos normais.

## Comanda (aba Comanda)

- Monta o pedido **clicando nos itens do cardápio**, com busca e grupos.
- **Várias comandas abertas ao mesmo tempo**, em abas, salvas no aparelho.
- Forma de pagamento obrigatória para fechar; no dinheiro, calcula troco.
- **Não existe** botão "Imprimir direto" nem "Abrir gaveta".
- **Não existe** campo para digitar taxa de entrega: a taxa vem da tabela por
  bairro do site. Sem tabela, a comanda sai com "a combinar".
- Comanda fechada entra no **caixa** pela forma de pagamento, aparece no
  **histórico** da aba Comanda e em **Todos de hoje**.
- Abrir uma comanda do histórico para editar **tira ela do caixa** enquanto
  estiver sendo mexida.

## Impressão

- **Uma página só**, no tamanho exato do conteúdo. Papel 80 mm, comanda 72 mm.
- Rodapé: apenas "Pedido feito pelo site". **Sem telefone.**
  *(o telefone do cabeçalho segue lá — o Matheus ainda não decidiu)*
- Tarja: ENTREGA / RETIRADA / NO RESTAURANTE.

## Caixa e relatório

- No fechamento do dia **não existe** a linha "Venda da comanda".
- Relatório do mês traz: faturamento total com a taxa, quanto o motoboy ganhou,
  venda da comanda, quanto gastou de mercadoria e **Líquido do mês**.
- Seletor de mês em **calendário**: um botão só, que abre a grade de doze meses
  com setas de ano. **Sem trava** de ano nem de mês, para trás e para a frente.
- A escolha de dia também é livre.

## Edição do cardápio pelo dono (21/09/2026)

- Aba **Cardápio** no painel: muda preço, marca "Acabou" (o item some do site),
  edita nome e descrição, e desfaz item por item.
- Os ajustes ficam no servidor e o site aplica por cima do cardápio do arquivo.
  Se o servidor falhar, valem os preços do arquivo — o site nunca fica sem
  cardápio.
- Acesso pela mesma senha do painel: só o Matheus e o dono.
- **Não existe** botão de apagar pedidos no painel. O Matheus foi explícito:
  o dono não pode ter essa opção. A limpeza é feita por fora, pela Criasiteweb.

## Entrega ao dono (21/09/2026)

- Regras do servidor publicadas pelo Matheus. Testado e funcionando:
  fechar a loja, leitura pública do estado, e a aba Cardápio.
- **Sistema zerado:** 7 pedidos de teste e 2 dias de caixa apagados.
  Conferido depois: 0 pedidos, 0 caixas.
- Senha do painel: **123456** (trocada pelo Matheus). Vale sugerir uma mais
  forte ao entregar, já que o painel mostra nome, telefone e endereço dos
  clientes.

## Pendente (depende do Matheus ou do dono)

- Decidir se o telefone sai do cabeçalho da comanda.
- Receber a lista de bairros com os valores da taxa de entrega.
- Confirmar se "Fanta laranja ou uva" é de 2 litros.

## Verificado em 21/09/2026

- **O pedido do site chega no painel.** Testado de ponta a ponta: um pedido de
  teste ("Teste Criasiteweb") foi enviado pelo caminho real do site e o
  servidor aceitou. O que o Matheus via era a versão antiga guardada no
  navegador dele.
- **O CEP preenche o endereço sozinho.** Testado na versão publicada com o CEP
  08671-330: preencheu "Rua Eunice Cerqueira Innocencio", bairro Jardim
  Quaresmeira, cidade Suzano.
