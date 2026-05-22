/** Libellés locaux (les suggestions détaillées viennent de l’API /events/publish-suggestions) */

export type TicketDraft = { label: string; price: string; quantity: string }

export const emptyTicketRow = (): TicketDraft => ({
  label: '',
  price: '0',
  quantity: '100',
})
