const users = {}
const history = {}

function addTextsToHistory(senderId, recipientId, data) {
  if (history[senderId]) {
    if (history[senderId][recipientId]) {
      if (history[senderId][recipientId].length > 10) {
        history[senderId][recipientId].shift()
      }
      history[senderId][recipientId].push(data)
    } else {
      history[senderId][recipientId] = []
      history[senderId][recipientId].push(data)
    }
  } else {
    history[senderId] = {}
    history[senderId][recipientId] = []
    history[senderId][recipientId].push(data)
  }
}

module.exports = (server) => {
  const io = require('socket.io').listen(server)

  io.on('connection', (socket) => {
    const socketId = socket.id

    socket.on('users:connect', (data) => {
      const user = {
        ...data, // username and userId
        socketId,
        activeRoom: null
      }
      users[socketId] = user

      socket.emit('users:list', Object.values(users))
      socket.broadcast.emit('users:add', user)
    })

    socket.on('message:add', (data) => {
      const { senderId, recipientId } = data

      socket.emit('message:add', data)
      socket.broadcast.to(data.roomId).emit('message:add', data)

      addTextsToHistory(senderId, recipientId, data)
      addTextsToHistory(recipientId, senderId, data)

    })

    socket.on('message:history', (data) => {
      if (history[data.userId] && history[data.userId][data.recipientId]) {
        socket.emit('message:history', history[data.userId][data.recipientId])
      }
    })

    socket.on('disconnect', () => {
      delete users[socketId]

      socket.broadcast.emit('users:leave', socketId)
    })
  })
}