const Ticket = require("../models/Ticket")

class TicketDAO {
  async create(ticketData) {
    try {
      const newTicket = new Ticket(ticketData)
      return await newTicket.save()
    } catch (error) {
      throw new Error(`Error creating ticket: ${error.message}`)
    }
  }

  async findById(id) {
    try {
      return await Ticket.findById(id).populate("products.product").populate("user", "-password")
    } catch (error) {
      throw new Error(`Error finding ticket by ID: ${error.message}`)
    }
  }

  async findByCode(code) {
    try {
      return await Ticket.findOne({ code }).populate("products.product").populate("user", "-password")
    } catch (error) {
      throw new Error(`Error finding ticket by code: ${error.message}`)
    }
  }

  async findByUser(userId, options = {}) {
    try {
      const { limit = 10, skip = 0, sort = { purchase_datetime: -1 } } = options
      return await Ticket.find({ user: userId }).populate("products.product").limit(limit).skip(skip).sort(sort)
    } catch (error) {
      throw new Error(`Error finding tickets by user: ${error.message}`)
    }
  }

  async findAll(filter = {}, options = {}) {
    try {
      const { limit = 10, skip = 0, sort = { purchase_datetime: -1 } } = options
      return await Ticket.find(filter)
        .populate("products.product")
        .populate("user", "-password")
        .limit(limit)
        .skip(skip)
        .sort(sort)
    } catch (error) {
      throw new Error(`Error finding tickets: ${error.message}`)
    }
  }

  async update(id, updateData) {
    try {
      return await Ticket.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
        .populate("products.product")
        .populate("user", "-password")
    } catch (error) {
      throw new Error(`Error updating ticket: ${error.message}`)
    }
  }

  async countDocuments(filter = {}) {
    try {
      return await Ticket.countDocuments(filter)
    } catch (error) {
      throw new Error(`Error counting tickets: ${error.message}`)
    }
  }

  async delete(id) {
    try {
      return await Ticket.findByIdAndDelete(id)
    } catch (error) {
      throw new Error(`Error deleting ticket: ${error.message}`)
    }
  }
}

module.exports = new TicketDAO()
