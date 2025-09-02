/**
 * Data Transfer Objects para Ticket
 * Filtran información sensible y estructuran las respuestas
 */

class TicketDTO {
  constructor(ticket) {
    this.id = ticket._id
    this.code = ticket.code
    this.purchase_datetime = ticket.purchase_datetime
    this.amount = ticket.amount
    this.purchaser = ticket.purchaser
    this.status = ticket.status

    this.products = Array.isArray(ticket.products)
      ? ticket.products.map((item) => ({
          product: {
            id: item.product?._id || item.product,
            title: item.product?.title || "Unknown Product",
            price: item.product?.price || item.price,
          },
          quantity: item.quantity,
          price: item.price,
          subtotal: (item.quantity * item.price).toFixed(2),
        }))
      : []

    this.user = {
      id: ticket.user?._id || ticket.user,
      email: ticket.user?.email || "Unknown",
      full_name: ticket.user ? `${ticket.user.first_name || ""} ${ticket.user.last_name || ""}`.trim() : "Unknown User",
    }
    this.createdAt = ticket.createdAt
  }

  static fromTicket(ticket) {
    return new TicketDTO(ticket)
  }
}

class TicketSummaryDTO {
  constructor(ticket) {
    this.id = ticket._id
    this.code = ticket.code
    this.purchase_datetime = ticket.purchase_datetime
    this.amount = ticket.amount
    this.status = ticket.status
    this.products_count = Array.isArray(ticket.products) ? ticket.products.length : 0
  }

  static fromTicket(ticket) {
    return new TicketSummaryDTO(ticket)
  }

  static fromTickets(tickets) {
    return tickets.map((ticket) => new TicketSummaryDTO(ticket))
  }
}

module.exports = {
  TicketDTO,
  TicketSummaryDTO,
}
