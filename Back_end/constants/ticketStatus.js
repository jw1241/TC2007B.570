const TICKET_STATUS = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En proceso",
  RESOLVED: "Resuelto"
};

Object.freeze(TICKET_STATUS); // prevents accidental changes

module.exports = TICKET_STATUS;