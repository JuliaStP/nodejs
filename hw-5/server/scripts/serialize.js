module.exports.serializeUser = (user) => {
  return {
    firstName: user.firstName,
    id: user._id,
    image: user.image,
    middleName: user.middleName,
    permission: user.permission,
    surName: user.surName,
    username: user.userName,
  }
}

module.exports.serializeNews= (news) => {
  return {
    id: news._id,
    created_at: news.created_at,
    text: news.text,
    title: news.title,
    user: news.user
  }
}