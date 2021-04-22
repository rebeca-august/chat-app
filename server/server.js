const { ApolloServer, gql, PubSub } = require('apollo-server')
const fs = require('fs')

const messages = []

const typeDefs = gql`
  type Message {
    id: ID!
    user: String!
    content: String!
  }

  type Query {
    messages: [Message!]
  }

  type Mutation {
    postMessage(user: String!, content: String!): ID!
  }

  type Subscription {
    messages: [Message!]
  }
`
const subscribers = []
const onMessagesUpdates = (fn) => subscribers.push(fn)

const resolvers = {
  Query: {
    messages: () => messages,
  },
  Mutation: {
    postMessage: (parent, { user, content }) => {
      const id = messages.length
      messages.push({
        id,
        user,
        content,
      })
      fs.appendFile(
        'messages.txt',
        `${Date.now()} ${user}: ${content}`,
        (err) => {
          if (err) return console.log(err)
          console.log('saved')
        },
      )
      subscribers.forEach((fn) => fn())
      return id
    },
  },
  Subscription: {
    messages: {
      subscribe: (parent, args, { pubsub }) => {
        const channel = Math.random().toString(36).slice(2, 15)
        onMessagesUpdates(() => pubsub.publish(channel, { messages }))
        setTimeout(() => pubsub.publish(channel, { messages }), 0)
        return pubsub.asyncIterator(channel)
      },
    },
  },
}

const pubsub = new PubSub()
const server = new ApolloServer({
  typeDefs,
  resolvers,
  subscriptions: {
    path: '/subscriptions',
  },
  context: { pubsub },
})
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
