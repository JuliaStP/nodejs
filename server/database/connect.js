const mongoose = require('mongoose')
const uri = 'mongodb+srv://loft-systems:10LoftSchool@cluster0.fji0e.mongodb.net/loft-systems?retryWrites=true&w=majority'

mongoose.Promise = global.Promise
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)
mongoose.connect(uri, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true,
})

mongoose.connection.on('connected', () => {
  console.log('Mongoose connection open')
})

mongoose.connection.on('error', () => {
  console.log('Mongoose connection error')
})

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected')
})
